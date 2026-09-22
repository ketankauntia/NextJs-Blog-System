import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { defineBlog, applySettings, settingsOf, type BlogConfig } from "./config.js";
import { parsePost, isPublished, validSlug, MAX_POST_BYTES } from "./core.js";

/** Walk every component; reject links, devices, and hard-linked files. No user path is executed. */
export function safePath(root: string, relative: string): string {
  if (!path.isAbsolute(root) || !relative || relative.includes("\\") || relative.split("/").some(p => !p || p === "." || p === ".." || /[:\x00-\x1f]/.test(p))) throw new Error("Unsafe filesystem path.");
  const absoluteRoot = path.resolve(root);
  if (fs.lstatSync(absoluteRoot).isSymbolicLink() || !fs.statSync(absoluteRoot).isDirectory()) throw new Error("App root must be a real directory.");
  let current = absoluteRoot;
  for (const part of relative.split("/")) {
    current = path.join(/* turbopackIgnore: true */ current, part);
    try {
      const stat = fs.lstatSync(/* turbopackIgnore: true */ current);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile()) || (stat.isFile() && stat.nlink > 1)) throw new Error("Symbolic links, hard links and special files are not supported.");
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  return current;
}

export function readFile(root: string, relative: string, limit = MAX_POST_BYTES): string {
  const file = safePath(root, relative);
  const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.nlink > 1 || stat.size > limit) throw new Error("File is not regular or exceeds its size limit.");
    const buffer = Buffer.alloc(limit + 1);
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
    if (bytes > limit) throw new Error("File exceeds its size limit.");
    return buffer.subarray(0, bytes).toString("utf8");
  } finally { fs.closeSync(fd); }
}

export const revision = (source: string) => createHash("sha256").update(source).digest("hex");
export function readConfig(root: string): BlogConfig { return defineBlog(JSON.parse(readFile(root, "blog-system-next.config.json", 16384))); }

export function readSettings(root: string, input: BlogConfig) {
  const base = defineBlog(input), relative = `${base.contentPath}/settings.json`;
  if (!fs.existsSync(safePath(root, relative))) return { config: base, settings: settingsOf(base), revision: null as string | null };
  const source = readFile(root, relative, 8192);
  const config = applySettings(base, JSON.parse(source));
  return { config, settings: settingsOf(config), revision: revision(source) };
}

export function saveSettings(root: string, base: BlogConfig, input: unknown, expectedRevision: string | null) {
  const config = applySettings(defineBlog(base), input);
  const settings = settingsOf(config), source = JSON.stringify(settings, null, 2) + "\n";
  if (Buffer.byteLength(source) > 8192) throw new Error("Settings exceed their size limit.");
  const nextRevision = writeVersioned(root, `${config.contentPath}/settings.json`, source, expectedRevision);
  return { settings, revision: nextRevision };
}

export function writeVersioned(root: string, relative: string, source: string, expectedRevision: string | null) {
  if (expectedRevision !== null && (typeof expectedRevision !== "string" || !/^[a-f0-9]{64}$/.test(expectedRevision))) throw new Error("Invalid revision.");
  const target = safePath(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const lock = safePath(root, `${relative}.lock`);
  let fd: number;
  try { fd = fs.openSync(lock, "wx", 0o600); } catch (error) { if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new Error("Conflict: another save is active (or its lock needs manual review)."); throw error; }
  const temporaryRelative = `${relative}.${randomUUID()}.tmp`, temporary = safePath(root, temporaryRelative);
  try {
    const exists = fs.existsSync(target);
    if (exists ? expectedRevision !== revision(readFile(root, relative)) : expectedRevision !== null) throw new Error("Conflict: this file changed. Reload before saving.");
    fs.writeFileSync(temporary, source, { flag: "wx", mode: 0o600 });
    safePath(root, relative);
    fs.renameSync(temporary, target);
    return revision(source);
  } finally { fs.closeSync(fd); if (fs.existsSync(temporary)) fs.unlinkSync(safePath(root, temporaryRelative)); fs.unlinkSync(safePath(root, `${relative}.lock`)); }
}

export function createStore(root: string, input: BlogConfig) {
  const config = defineBlog(input);
  const directory = `${config.contentPath}/posts`;
  const sourcePath = (slug: string) => { if (!validSlug(slug)) throw new Error("Invalid post slug."); return `${directory}/${slug}.md`; };
  function sources() {
    const target = safePath(root, directory);
    if (!fs.existsSync(target)) return [];
    const entries = fs.readdirSync(target);
    if (entries.length > 10000) throw new Error("Content directory exceeds 10,000 entries.");
    return entries.filter(file => file.endsWith(".md")).map(file => {
      const slug = file.slice(0, -3);
      const source = readFile(root, sourcePath(slug));
      try { return { source, revision: revision(source), post: parsePost(slug, source, config.author || config.name) }; }
      catch { throw new Error(`Invalid post metadata in ${slug}.md. Check frontmatter and field types.`); }
    });
  }
  return {
    config,
    publicPosts(now = Date.now()) { return sources().map(s => s.post).filter(p => isPublished(p, now)).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)); },
    authoringSources: sources,
    save(slug: string, source: string, expectedRevision: string | null) {
      parsePost(slug, source, config.author || config.name);
      return writeVersioned(root, sourcePath(slug), source, expectedRevision);
    },
  };
}
