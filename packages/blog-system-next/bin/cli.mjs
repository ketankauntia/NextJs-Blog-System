#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { inspect, configDefaults, planInstall, applyPlan, doctor, removalPlan, removeInstallation, upgradeInstallation } from "./installer.mjs";
import { readConfig } from "../dist/storage.js";
import { setupPreviews, routeAnswer, folderAnswer } from "./prompts.mjs";

async function main() {
  const parsed = parseArgs({ allowPositionals: true, strict: true, options: {
    cwd: { type: "string" }, yes: { type: "boolean", short: "y" }, "dry-run": { type: "boolean" },
    config: { type: "string" }, "package-file": { type: "string" }, route: { type: "string" }, "content-path": { type: "string" },
    port: { type: "string" }, help: { type: "boolean", short: "h" },
  } });
  const args = parsed.values;
  const command = parsed.positionals[0] ?? "help";
  if (parsed.positionals.length > 1) throw new Error("Unexpected positional argument.");
  if (args.help || command === "help") {
    console.log(`blog-system-next\n\n  init [--cwd app] [--dry-run] [--yes] [--config choices.json]\n       [--route /blog] [--content-path content/blog]\n  doctor [--cwd app]\n  studio [--cwd app] [--port 3000]\n  uninstall [--cwd app] [--dry-run] [--yes]\n\nInstallation asks only for the blog URL and content folder.\nPublication details are edited in Studio settings.\nNo sample posts, analytics tags or telemetry are installed.\nLicense: source-available; public blog footers retain attribution.\n`);
    return;
  }
  let root = path.resolve(args.cwd ?? process.cwd());
  let prompt;
  const ask = async (question, fallback, display = fallback, help) => {
    prompt ??= createInterface({ input: process.stdin, output: process.stdout });
    const label = `${question}${display !== undefined ? ` [${display}]` : ""}`;
    const answer = (await prompt.question(help ? `${label}\n${help}\n> ` : `${label}: `)).trim();
    return answer || fallback;
  };
  try {
    if (!args.cwd && fs.existsSync(path.join(root, "package.json"))) {
      const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
      if (manifest.workspaces && !manifest.dependencies?.next && !manifest.devDependencies?.next) {
        if (!process.stdin.isTTY || args.yes || args["dry-run"]) throw new Error("Monorepo detected: pass --cwd with the Next.js app directory.");
        root = path.resolve(root, await ask("Next.js workspace directory", undefined));
      }
    }
    if (command === "doctor") { console.log(JSON.stringify(doctor(root), null, 2)); return; }
    if (command === "studio") {
      inspect(root); doctor(root);
      const config = readConfig(root);
      if (!config.studio) throw new Error("Studio was not enabled in this installation.");
      const port = args.port ?? "3000";
      if (!/^\d{1,5}$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error("Choose a port between 1024 and 65535.");
      const require = createRequire(path.join(root, "package.json"));
      console.log(`Starting local-only Studio at http://127.0.0.1:${port}${config.studioRoute} (include your Next basePath if configured).`);
      const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", port], { cwd: root, stdio: "inherit", shell: false, env: { ...process.env, BLOG_SYSTEM_NEXT_STUDIO: "local", BLOG_SYSTEM_NEXT_STUDIO_TOKEN: randomBytes(32).toString("hex") } });
      child.on("error", error => { console.error(error.message); process.exitCode = 1; });
      child.on("exit", code => { process.exitCode = code ?? 1; });
      return;
    }
    if (command === "uninstall") {
      const plan = removalPlan(root);
      console.log(plan.changes.map(c => `${c.before === null ? "REMOVE" : "RESTORE"} ${c.file}`).join("\n"));
      console.log(`Preserve content and edited files: ${plan.preserved.join(", ") || "none found"}`);
      if (args["dry-run"]) return;
      if (!args.yes && (!process.stdin.isTTY || !["y", "yes"].includes((await ask("Apply these removals? y/n", "n")).toLowerCase()))) throw new Error("No files changed. Pass --yes to apply the reviewed plan.");
      removeInstallation(root, plan);
      console.log("Integration removed. Content and edited files preserved. Run npm uninstall blog-system-next when no imports remain."); return;
    }
    if (command !== "init") throw new Error(`Unknown command: ${command}`);
    const info = inspect(root);
    // `npx blog-system-next init` may run the CLI from npx's temporary cache.
    // Add the same package to the selected app so generated imports resolve on
    // the first build. Existing dependencies are never changed.
    const manifestPath = path.join(root, "package.json");
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const installed = manifest.dependencies?.["blog-system-next"] || manifest.devDependencies?.["blog-system-next"];
      const version = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
      let installedVersion;
      try {const require=createRequire(manifestPath);const entry=require.resolve('blog-system-next');installedVersion=JSON.parse(fs.readFileSync(path.resolve(path.dirname(entry),'../package.json'),'utf8')).version;} catch { /* Not installed in this app yet. */ }
      if (!installed || installedVersion!==version) {
        if (!args["dry-run"]) {
          console.log(`Installing blog-system-next@${version} in this app...`);
          const requestedPackage = args["package-file"] ? path.resolve(root, args["package-file"]) : `blog-system-next@${version}`;
          if (args["package-file"] && !fs.existsSync(requestedPackage)) throw new Error(`Package file not found: ${requestedPackage}`);
          const npmExecutable = process.env.npm_execpath ? process.execPath : "npm";
          const npmArguments = process.env.npm_execpath ? [process.env.npm_execpath, "install", "--save-exact", requestedPackage] : ["install", "--save-exact", requestedPackage];
          const result = spawnSync(npmExecutable, npmArguments, { cwd: root, stdio: "inherit", shell: false, env: process.env });
          if (result.status !== 0) throw new Error(`Could not add blog-system-next@${version}. Install it manually, then run this command again.`);
        }
      }
    }
    let input = args.config ? JSON.parse(fs.readFileSync(path.resolve(root, args.config), "utf8")) : {};
    const mapping = { route: "route", "content-path": "contentPath" };
    for (const [flag, key] of Object.entries(mapping)) if (args[flag] !== undefined) input[key] = args[flag];
    const allowed = ["route", "contentPath"];
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !allowed.includes(key))) throw new Error("Unknown or invalid setup configuration.");
    const config = configDefaults(input, root);
    const nextSteps = saved => console.log(`\nReady. Your blog is installed with no sample posts.\n\n1. Run: npm run dev\n2. Open: http://localhost:3000${saved.route}\n3. Click Open Studio or visit http://localhost:3000${saved.studioRoute}/\n\nBlog: ${saved.route}    Studio: ${saved.studioRoute}\nThe project name links back to your website homepage.\n`);
    if (fs.existsSync(path.join(root, ".blog-system-next-install.json"))) { const updated=args['dry-run']?0:upgradeInstallation(root);console.log(JSON.stringify(doctor(root), null, 2)); console.log(`Already installed. ${updated} integration files updated. Your content and settings were preserved.`); nextSteps(readConfig(root)); return; }
    if (process.stdin.isTTY && !args.yes && !args["dry-run"]) {
      const previews = setupPreviews(root, config);
      console.log("Press Enter to keep each default. Set your real domain later in Studio settings.");
      if (input.route === undefined) {
        config.route = routeAnswer(await ask("1. Blog URL", config.route, previews.blog, "Where readers will find your posts. Press Enter to keep /blog."), previews.origin);
      }
      if (input.contentPath === undefined) {
        config.contentPath = folderAnswer(await ask("2. Content folder", config.contentPath, previews.content, "Where your posts are saved in this project. Press Enter to keep this folder."), previews.project);
      }
    }
    const plan = planInstall(info, config);
    console.log(`\nApp: ${root}\nAnalytics: none added (existing host analytics remain user-controlled).\n`);
    const previews = setupPreviews(root, plan.config);
    console.log(`Blog URL: ${previews.blog}${plan.config.siteUrl ? "" : " (example domain)"}\nContent folder: ${previews.content}\nBlog title: ${plan.config.name}\n`);
    console.log(plan.changes.map(c => `${c.before === null ? "CREATE" : c.kind === "next" ? "WRAP" : "UPDATE"} ${c.file}`).join("\n"));
    console.log("Required visible footer credit: Powered by nextjsblog.com. See package LICENSE.");
    if (args["dry-run"]) return;
    if (!args.yes && !process.stdin.isTTY) throw new Error("No files changed. Pass --yes to install with defaults or --dry-run to preview.");
    applyPlan(plan);
    nextSteps(config);
  } finally { prompt?.close(); }
}
main().catch(error => { console.error(`blog-system-next: ${error.message}`); process.exitCode = 1; });
