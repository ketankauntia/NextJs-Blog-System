import fs from "node:fs";
import path from "node:path";
import { validateContentPath } from "./paths.mjs";

/** Shared by the app and its CLI audit. The config is server-side, non-secret data. */
export function localContentPath() {
  const configFile = path.join(process.cwd(), "publishing.json");
  if (!fs.existsSync(configFile)) return "content";
  if (fs.lstatSync(configFile).isSymbolicLink()) throw new Error("publishing.json must be a regular file in this repository.");
  const setup = JSON.parse(fs.readFileSync(configFile, "utf8"));
  if (setup.mode !== "local") {
    throw new Error("This installation needs an authenticated remote content adapter before using a login-based publishing.json. Follow /docs/agent-setup.");
  }
  if (setup.destination !== "github" || ![1, 2].includes(setup.schemaVersion)) throw new Error("Unsupported local publishing.json configuration.");
  return validateContentPath(setup.contentPath ?? "content");
}

/** Reject traversal and symlinks for both readers and writers, including final files. */
export function resolveLocalContent(...segments) {
  const relativeRoot = localContentPath();
  if (segments.some(segment => typeof segment !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment) || segment === "..")) {
    throw new Error("Invalid content file path.");
  }
  let current = process.cwd();
  for (const segment of [...relativeRoot.split("/"), ...segments]) {
    // next.config.ts explicitly includes only the selected content files in server traces.
    current = path.join(/* turbopackIgnore: true */ current, segment);
    try {
      if (fs.lstatSync(/* turbopackIgnore: true */ current).isSymbolicLink()) throw new Error("Content paths must not contain symbolic links.");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return current;
}
