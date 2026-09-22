import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {buildStudio} from './build-studio.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = path.join(root, "packages/blog-system-next");
// Reuse the application's constrained Markdown parser and block types verbatim.
for (const file of ["parse.ts", "types.ts"]) {
  const source = fs.readFileSync(path.join(root, "lib/blog", file), "utf8").replace('from "./types"', 'from "./types.js"');
  fs.writeFileSync(path.join(pkg, "src", file), source);
}
fs.copyFileSync(path.join(root, "LICENSE"), path.join(pkg, "LICENSE"));
const result = spawnSync(process.execPath, [path.join(root, "node_modules/typescript/bin/tsc"), "-p", path.join(pkg, "tsconfig.json")], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
fs.copyFileSync(path.join(pkg, "src/styles.css"), path.join(pkg, "dist/styles.css"));
await buildStudio(root,pkg);
fs.copyFileSync(path.join(pkg,'src/studio-view.mjs'),path.join(pkg,'dist/oss-entry.js'));
fs.copyFileSync(path.join(pkg,'src/oss-entry.d.ts'),path.join(pkg,'dist/oss-entry.d.ts'));
fs.copyFileSync(path.join(pkg,'src/public-view.mjs'),path.join(pkg,'dist/public-entry.js'));
fs.copyFileSync(path.join(pkg,'src/public-entry.d.ts'),path.join(pkg,'dist/public-entry.d.ts'));
fs.writeFileSync(path.join(pkg,'dist/studio-fonts.js'),'export {fontVariables} from "./oss/lib/fonts.js";\n');
fs.copyFileSync(path.join(pkg,'src/studio-fonts.d.ts'),path.join(pkg,'dist/studio-fonts.d.ts'));
console.log("Built blog-system-next (no website assets or analytics copied).");
