import path from "node:path";
import { routePath, contentPath } from "../dist/config.js";

export function setupPreviews(root, config) {
  const project = path.basename(root);
  const origin = config.siteUrl || "https://domain.com";
  return {
    project,
    origin,
    blog: `${origin.replace(/^https:\/\//, "")}${config.route}/`,
    content: `${project}/${config.contentPath}`,
  };
}

export function routeAnswer(answer, origin) {
  const host = new URL(origin).host;
  let route = answer;
  for (const prefix of [origin, `https://${host}`, host]) {
    if (route.startsWith(prefix + "/")) { route = route.slice(prefix.length); break; }
  }
  return routePath(route.replace(/\/$/, ""));
}

export function folderAnswer(answer, project) {
  const folder = answer.startsWith(project + "/") ? answer.slice(project.length + 1) : answer;
  return contentPath(folder);
}
