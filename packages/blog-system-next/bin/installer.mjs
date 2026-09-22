import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { defineBlog } from "../dist/config.js";
import { createStore, safePath, readFile, readSettings } from "../dist/storage.js";

const STATE = ".blog-system-next-install.json";
const LOCK = ".blog-system-next-install.lock";
const CONFIG = "blog-system-next.config.json";
const hash = value => createHash("sha256").update(value).digest("hex");
const json = value => JSON.stringify(value, null, 2) + "\n";
const exists = (root, relative) => fs.existsSync(safePath(root, relative));

export function inspect(root) {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 14)) throw new Error("blog-system-next requires Node.js 22.14 or newer.");
  root = path.resolve(root);
  const manifest = JSON.parse(readFile(root, "package.json", 1024 * 1024));
  let ancestor = root;
  for (;;) {
    for (const file of ["pnpm-lock.yaml", "bun.lock", "bun.lockb", "yarn.lock"]) if (fs.existsSync(path.join(ancestor, file))) throw new Error("This preview supports npm projects only. Existing package-manager lockfiles were preserved.");
    const packageFile = path.join(ancestor, "package.json");
    if (fs.existsSync(packageFile)) {
      const value = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      if (value.packageManager && !value.packageManager.startsWith("npm@")) throw new Error("This preview supports npm only; packageManager was preserved.");
    }
    const parent = path.dirname(ancestor); if (parent === ancestor) break; ancestor = parent;
  }
  const require = createRequire(path.join(root, "package.json"));
  const versions = {};
  for (const name of ["next", "react", "react-dom"]) {
    try { versions[name] = JSON.parse(fs.readFileSync(require.resolve(`${name}/package.json`), "utf8")).version; }
    catch { throw new Error(`Install ${name} in the selected Next.js app first. For a new app, run create-next-app separately.`); }
  }
  const nextSupported = /^16\.3\.\d+$/.test(versions.next) && Number(versions.next.split('.')[2])>=3;
  const reactSupported = /^19\.\d+\.\d+$/.test(versions.react) && versions.react === versions["react-dom"];
  if (!nextSupported || !reactSupported) throw new Error(`This alpha supports the verified Next 16.3.x and React/React DOM 19.x ranges. Found ${JSON.stringify(versions)}. No dependencies were changed.`);
  const dirs = ["app", "src/app"].filter(dir => exists(root, dir));
  if (dirs.length !== 1) throw new Error("Select an app with exactly one app/ or src/app/ directory. Pages Router alone is unsupported.");
  const appDir = dirs[0];
  if (!fs.readdirSync(safePath(root, appDir)).some(file => /^layout\.(tsx|jsx|js)$/.test(file))) throw new Error("A root App Router layout is required. Route-group-only root layouts need manual integration.");
  const extension = exists(root, "tsconfig.json") ? "tsx" : "jsx";
  if (exists(root, "next.config.cjs")) throw new Error("Next.js does not load next.config.cjs. Use a supported next.config.js, .mjs or .ts first.");
  const nextConfigs = ["next.config.ts", "next.config.mjs", "next.config.js"].filter(file => exists(root, file));
  if (nextConfigs.length > 1) throw new Error("Multiple Next config files found; resolve the ambiguity first.");
  const nextFile = nextConfigs[0] ?? "next.config.mjs";
  return { root, manifest, versions, appDir, extension, nextFile, configExists: nextConfigs.length > 0 };
}

function routes(root, directory, prefix = [], results = [], counter = { count: 0 }) {
  for (const entry of fs.readdirSync(safePath(root, directory), { withFileTypes: true })) {
    if (++counter.count > 20000) throw new Error("App tree too large for automatic route inspection.");
    const relative = `${directory}/${entry.name}`;
    safePath(root, relative);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_")) continue;
      const transparent = /^\([^)]*\)$/.test(entry.name) || entry.name.startsWith("@");
      routes(root, relative, transparent ? prefix : [...prefix, entry.name], results, counter);
    } else if (/^(page|route)\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) results.push({ parts: prefix, relative });
  }
  return results;
}

function conflict(existing, mount) {
  const requested = mount.slice(1).split("/");
  const parts = existing.parts;
  for (let i = 0; i < Math.min(parts.length, requested.length); i++) {
    if (parts[i].includes("...")) return true;
    if (!parts[i].startsWith("[") && parts[i] !== requested[i]) return false;
  }
  return parts.length >= requested.length || parts.some(p => p.includes("..."));
}

export function configDefaults(options = {}, root = process.cwd()) {
  if (options.schemaVersion !== undefined && options.schemaVersion !== 1) throw new Error("Unsupported setup schema version.");
  return defineBlog({ schemaVersion: 1, route: options.route ?? "/blog", contentPath: options.contentPath ?? "content/blog", name: options.name ?? path.basename(root), description: options.description ?? "", author: options.author ?? "", siteUrl: options.siteUrl ?? "", studio: options.studio ?? true, studioRoute: options.studioRoute ?? "/blog-studio", theme: options.theme ?? "default" });
}

function generated(info, config) {
  const { appDir, extension } = info;
  const entries = new Map();
  const put = (name, text) => entries.set(name, text);
  const helper = `${appDir}/blog-system-next.server.${extension === "tsx" ? "ts" : "js"}`;
  const configImport = path.posix.relative(appDir, CONFIG);
  put(helper, `import "server-only";\nimport { createBlog } from "blog-system-next/server";\nimport { defineBlog } from "blog-system-next";\nimport config from ${JSON.stringify(configImport.startsWith(".") ? configImport : "./" + configImport)};\n\nexport const blog = createBlog({ root: process.cwd(), config: defineBlog(config), basePath: process.env.BLOG_SYSTEM_NEXT_BASE_PATH || "" });\n`);
  const handlerHelper = helper.replace(".server.", ".handlers.");
  put(handlerHelper, entries.get(helper).replace('createBlog } from "blog-system-next/server"', 'createBlogHandlers } from "blog-system-next/handlers"').replace("= createBlog(", "= createBlogHandlers("));
  const importHelper = (directory, handler = false) => {
    let relative = path.posix.relative(directory, (handler ? handlerHelper : helper).replace(/\.(ts|js)$/, ""));
    if (!relative.startsWith(".")) relative = "./" + relative;
    return `import { blog } from ${JSON.stringify(relative)};\n`;
  };
  const blogDir = `${appDir}${config.route}`;
  put(`${blogDir}/[[...path]]/page.${extension}`, importHelper(`${blogDir}/[[...path]]`) + `import "blog-system-next/styles.css";\nimport "blog-system-next/studio.css";\nexport const runtime = "nodejs";\nexport const dynamic = "force-dynamic";\nexport const generateMetadata = blog.generateMetadata;\nexport default blog.Page;\n`);
  for (const [suffix, fn] of [["rss.xml", "RSS"], ["sitemap.xml", "Sitemap"], ["search.json", "Search"], ["llms.txt", "Llms"], ["raw/[slug]", "Markdown"]]) {
    put(`${blogDir}/${suffix}/route.${extension === "tsx" ? "ts" : "js"}`, importHelper(`${blogDir}/${suffix}`, true) + `export const runtime = "nodejs";\nexport const dynamic = "force-dynamic";\nexport const GET = blog.${fn};\n`);
  }
  if (config.studio) {
    const studioDir = `${appDir}${config.studioRoute}`;
    put(`${studioDir}/page.${extension}`, importHelper(studioDir) + `import "blog-system-next/studio.css";\nexport const runtime = "nodejs";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "Local Studio", robots: { index: false, follow: false } };\nexport default blog.Studio;\n`);
    for (const page of ["board", "editor", "editor/preview", "settings", "preview", "fonts"]) {
      const directory = `${studioDir}/${page}`;
      put(`${directory}/page.${extension}`, importHelper(directory) + `import "blog-system-next/studio.css";\nexport const runtime = "nodejs";\nexport const dynamic = "force-dynamic";\nexport const metadata = { title: "Studio", robots: { index: false, follow: false } };\nexport default blog.Studio;\n`);
    }
    put(`${studioDir}/api/route.${extension === "tsx" ? "ts" : "js"}`, importHelper(`${studioDir}/api`, true) + `export const runtime = "nodejs";\nexport const dynamic = "force-dynamic";\nexport const POST = blog.StudioAPI;\n`);
  }
  return entries;
}

function localDevChange(root) {
  const before=readFile(root,'package.json',1024*1024), manifest=JSON.parse(before);
  const script=manifest.scripts?.dev ?? 'next dev';
  if(!/^next\s+dev(?:\s|$)/.test(script)||/[;&|><\r\n]/.test(script)) throw new Error('Local Studio needs a direct next dev script. Set scripts.dev to "next dev --hostname 127.0.0.1" before installing. Existing scripts were preserved.');
  const withoutHost=script.replace(/\s+(?:--hostname|-H)(?:=|\s+)(?:"[^"]*"|'[^']*'|\S+)/g,'');
  const nextScript=withoutHost+' --hostname 127.0.0.1';
  if(script===nextScript) return null;
  manifest.scripts={...manifest.scripts,dev:nextScript};
  return {file:'package.json',before,after:json(manifest),kind:'dev-script'};
}

export function planInstall(info, input, { sample = false } = {}) {
  if (sample) throw new Error("Sample posts are not supported. Create your first post in Studio after installation.");
  const config = defineBlog(input), { root, nextFile } = info;
  if (exists(root, STATE)) return { existing: true, changes: [], config, info };
  if (exists(root, LOCK)) throw new Error("An installation lock exists. Inspect the interrupted run before retrying.");
  for (const existing of routes(root, info.appDir)) for (const mount of [config.route, ...(config.studio ? [config.studioRoute] : [])]) if (conflict(existing, mount)) throw new Error(`Route conflict: ${existing.relative} overlaps ${mount}. Choose another route; nothing was overwritten.`);
  for (const pagesDir of ["pages", "src/pages"]) if (exists(root, pagesDir)) {
    // Hybrid apps require explicit route migration; never guess about Pages route ownership.
    throw new Error("Hybrid Pages/App Router projects require manual integration in this alpha.");
  }
  const changes = [...generated(info, config)].map(([file, after]) => ({ file, before: null, after, kind: "generated" }));
  changes.push({ file: CONFIG, before: null, after: json(config), kind: "config" });
  if(config.studio) {const dev=localDevChange(root);if(dev) changes.push(dev);}
  const backup = nextFile.replace(/\.(ts|mjs|cjs|js)$/, ".blog-system-next-original.$1");
  const original = info.configExists ? readFile(root, nextFile, 1024 * 1024) : null;
  if (original !== null) changes.push({ file: backup, before: null, after: original, kind: "backup" });
  const cjs = nextFile.endsWith(".cjs") || (nextFile.endsWith(".js") && info.manifest.type !== "module");
  const source = original === null ? "const original = {};\n" : cjs ? `const original = require(${JSON.stringify("./" + backup)});\n` : `import original from ${JSON.stringify("./" + backup.replace(/\.ts$/, ""))};\n`;
  const typed = nextFile.endsWith(".ts");
  const wrapper = cjs
    ? `${source}module.exports = async (...args) => {\n  const { withBlog } = await import("blog-system-next/next");\n  return withBlog(await (typeof original === "function" ? original(...args) : original), { root: process.cwd() });\n};\n`
    : `import { withBlog } from "blog-system-next/next";\n${typed ? 'import type { NextConfig } from "next";\n' : ""}${source}const sourceConfig${typed ? ": unknown" : ""} = original;\nexport default async function${typed ? " (phase: string, context: unknown)" : " (phase, context)"} {\n  const resolved = await (typeof sourceConfig === "function" ? sourceConfig(phase, context) : sourceConfig);\n  return withBlog(${typed ? "resolved as NextConfig" : "resolved"}, { root: process.cwd() });\n}\n`;
  changes.push({ file: nextFile, before: original, after: wrapper, kind: "next" });
  for (const change of changes) {
    safePath(root, change.file);
    if (change.before === null && exists(root, change.file)) throw new Error(`File conflict: ${change.file}. Existing files were preserved.`);
  }
  // Validate existing posts before creating any files; reuse only compatible private content.
  createStore(root, config).authoringSources();
  return { existing: false, changes, config, info };
}

function writeExclusive(root, relative, text) {
  const target = safePath(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  safePath(root, relative);
  fs.writeFileSync(target, text, { flag: "wx", mode: 0o600 });
}

function replaceChecked(root, relative, before, after) {
  if (readFile(root, relative, 2 * 1024 * 1024) !== before) throw new Error(`Conflict: ${relative} changed during setup.`);
  const temporary = `${relative}.blog-system-next-tmp`;
  writeExclusive(root, temporary, after);
  try { safePath(root, relative); fs.renameSync(safePath(root, temporary), safePath(root, relative)); }
  finally { if (exists(root, temporary)) fs.unlinkSync(safePath(root, temporary)); }
}

export function applyPlan(plan) {
  if (plan.existing) return;
  const { root } = plan.info;
  const lock = fs.openSync(safePath(root, LOCK), "wx", 0o600);
  const completed = [];
  let stateWritten = false;
  try {
    const state = { schemaVersion: 1, status: "applying", appDir: plan.info.appDir, extension: plan.info.extension, nextFile: plan.info.nextFile, config: plan.config, changes: plan.changes.map(c => ({ ...c, hash: hash(c.after) })) };
    writeExclusive(root, STATE, json(state)); stateWritten = true;
    for (const change of plan.changes) {
      if (change.before === null) writeExclusive(root, change.file, change.after);
      else replaceChecked(root, change.file, change.before, change.after);
      completed.push(change);
    }
    replaceChecked(root, STATE, json(state), json({ ...state, status: "complete" }));
  } catch (error) {
    for (const change of completed.reverse()) {
      if (readFile(root, change.file, 2 * 1024 * 1024) !== change.after) continue;
      if (change.before === null) fs.unlinkSync(safePath(root, change.file));
      else replaceChecked(root, change.file, change.after, change.before);
    }
    if (stateWritten && exists(root, STATE)) fs.unlinkSync(safePath(root, STATE));
    throw error;
  } finally { fs.closeSync(lock); fs.unlinkSync(safePath(root, LOCK)); }
}

export function installationState(root) {
  const state = JSON.parse(readFile(root, STATE, 2 * 1024 * 1024));
  if (state.schemaVersion !== 1 || !["app", "src/app"].includes(state.appDir) || !["tsx", "jsx"].includes(state.extension) || !/^next\.config\.(ts|mjs|js|cjs)$/.test(state.nextFile) || !Array.isArray(state.changes)) throw new Error("Invalid installation state; manual review required.");
  const config = defineBlog(state.config);
  const allowed = new Set([...generated(state, config).keys(), CONFIG, 'package.json', state.nextFile, state.nextFile.replace(/\.(ts|mjs|cjs|js)$/, ".blog-system-next-original.$1"), `${config.contentPath}/posts/hello-world.md`]);
  const seen = new Set();
  for (const c of state.changes) {
    if (!allowed.has(c.file) || seen.has(c.file) || typeof c.after !== "string" || !(c.before === null || ([state.nextFile,'package.json'].includes(c.file) && typeof c.before === "string")) || (c.file==='package.json'&&(c.kind!=='dev-script'||typeof c.before!=='string')) || c.hash !== hash(c.after)) throw new Error("Unsafe installation state; manual review required.");
    safePath(root, c.file); seen.add(c.file);
  }
  return state;
}

export function removalPlan(root) {
  const state = installationState(root);
  const changes = [], preserved = [];
  for (const change of state.changes) {
    if (!exists(root, change.file)) continue;
    if(change.kind==='dev-script') {
      const current=readFile(root,change.file,2*1024*1024),manifest=JSON.parse(current),installed=JSON.parse(change.after),original=JSON.parse(change.before);
      if(manifest.scripts?.dev!==installed.scripts?.dev) {preserved.push(change.file);continue;}
      const restored={...manifest,scripts:{...manifest.scripts}};
      if(original.scripts?.dev===undefined) delete restored.scripts.dev;
      else restored.scripts.dev=original.scripts.dev;
      if(!original.scripts&&Object.keys(restored.scripts).length===0) delete restored.scripts;
      changes.push({...change,after:current,before:json(restored),hash:hash(current)});
      continue;
    }
    if (change.file.startsWith(state.config.contentPath + "/") || hash(readFile(root, change.file, 2 * 1024 * 1024)) !== change.hash) { preserved.push(change.file); continue; }
    changes.push(change);
  }
  const next = state.changes.find(c => c.file === state.nextFile);
  const backupName = state.nextFile.replace(/\.(ts|mjs|cjs|js)$/, ".blog-system-next-original.$1");
  const backup = state.changes.find(c => c.file === backupName);
  // An edited original config is valuable and may still be imported by the wrapper.
  if (preserved.includes(state.nextFile) || (backup && preserved.includes(backup.file))) throw new Error("Next configuration was edited after setup. Merge/restore it manually before uninstalling; all files were preserved.");
  if (next?.before !== null && backup && !exists(root, backupName)) throw new Error("Original Next config backup is missing; review before uninstalling.");
  return { state, changes, preserved };
}

export function removeInstallation(root, plan) {
  if (exists(root, LOCK)) throw new Error("Installation lock exists; inspect it before uninstalling.");
  const lock = fs.openSync(safePath(root, LOCK), "wx", 0o600);
  try {
    for (const change of plan.changes) {
      if (hash(readFile(root, change.file, 2 * 1024 * 1024)) !== change.hash) throw new Error(`Conflict: ${change.file} changed; retry after review.`);
    }
    // Restore the Next config before removing its imported backup.
    for (const change of [...plan.changes].sort((a, b) => Number(b.file === plan.state.nextFile) - Number(a.file === plan.state.nextFile))) {
      if (change.before !== null) replaceChecked(root, change.file, change.after, change.before);
      else fs.unlinkSync(safePath(root, change.file));
    }
    fs.unlinkSync(safePath(root, STATE));
  } finally { fs.closeSync(lock); fs.unlinkSync(safePath(root, LOCK)); }
}

export function doctor(root) {
  const info = inspect(root);
  const config = defineBlog(JSON.parse(readFile(root, CONFIG, 16384)));
  const state = installationState(root);
  if (state.status !== "complete") throw new Error("Interrupted installation. Run uninstall --dry-run to inspect recovery.");
  for (const key of ["route", "studio", "studioRoute"]) if (state.config[key] !== config[key]) throw new Error(`${key} differs from the installed route files. Review/reinstall route mounts instead of editing these values alone.`);
  for (const change of state.changes.filter(c => c.kind === "generated" || c.kind === "next")) {
    if (!exists(root, change.file) || hash(readFile(root, change.file, 2 * 1024 * 1024)) !== change.hash) throw new Error(`Generated file changed or missing: ${change.file}. Preserved; review the diff manually.`);
  }
  const effective = readSettings(root, config).config;
  const sources = createStore(root, effective).authoringSources();
  return { versions: info.versions, posts: sources.length, siteUrlConfigured: !!effective.siteUrl, analytics: "none added", studio: config.studio ? "explicit local session only" : "disabled" };
}

/** Refresh only installer-owned routes whose previous content still matches. */
export function upgradeInstallation(root) {
  doctor(root);
  const state=installationState(root), info=inspect(root);
  const config=defineBlog(JSON.parse(readFile(root,CONFIG,16384)));
  const desired=generated(info,config), updates=[];
  const dev=config.studio?localDevChange(root):null;
  if(dev) updates.push(dev);
  for(const [file,after] of desired) {
    const previous=state.changes.find(c=>c.file===file);
    if(previous) {if(previous.after!==after) updates.push({file,before:previous.after,after});}
    else {
      if(exists(root,file)) throw new Error(`Route already exists: ${file}. Preserved; review manually.`);
      const directory=path.posix.dirname(file);
      if(routes(root,info.appDir).some(r=>path.posix.dirname(r.relative)===directory)) throw new Error(`Route already exists: ${directory}. Preserved; review manually.`);
      updates.push({file,before:null,after});
    }
  }
  if(!updates.length) return 0;
  const lock=fs.openSync(safePath(root,LOCK),'wx',0o600), completed=[];
  const beforeState=readFile(root,STATE,2*1024*1024);
  try {
    for(const change of updates) {
      if(change.before===null) writeExclusive(root,change.file,change.after);
      else replaceChecked(root,change.file,change.before,change.after);
      completed.push(change);
    }
    const changes=state.changes.map(c=>desired.has(c.file)?{...c,after:desired.get(c.file),hash:hash(desired.get(c.file))}:c);
    if(dev) {const existing=changes.find(c=>c.file==='package.json');if(existing) {existing.after=dev.after;existing.hash=hash(dev.after);} else changes.push({...dev,hash:hash(dev.after)});}
    for(const c of updates.filter(c=>c.before===null)) changes.push({...c,kind:'generated',hash:hash(c.after)});
    replaceChecked(root,STATE,beforeState,json({...state,changes}));
    return updates.length;
  } catch(error) {
    for(const c of completed.reverse()) {
      if(readFile(root,c.file,2*1024*1024)!==c.after) continue;
      if(c.before===null) fs.unlinkSync(safePath(root,c.file));
      else replaceChecked(root,c.file,c.after,c.before);
    }
    throw error;
  } finally {fs.closeSync(lock);fs.unlinkSync(safePath(root,LOCK));}
}
