import { validateContentPath, validateLoginRoute, validateBlogRoute } from "./paths.mjs";

export type PublishingMode = "local" | "self-hosted" | "managed";
export type ContentDestination = "github" | "supabase" | "r2";
export type HostingTarget = "vercel" | "self-hosted" | "existing";
export type InstallationTarget = "fresh" | "existing";
export type ExistingContent = "keep" | "migrate" | "replace";
export type AssetStorage = "repository" | "supabase" | "r2";

/** Portable, non-secret installation choices. Provider selection does not connect an account. */
export type PublishingSetup = {
  schemaVersion: 2;
  installation: InstallationTarget;
  projectName: string | null;
  mode: PublishingMode;
  destination: ContentDestination;
  contentPath: string;
  blogRoute: string;
  existingContent: ExistingContent | null;
  loginRoute: string | null;
  authentication: "none" | "email-password";
  oauth: false;
  assets: AssetStorage;
  database: "none" | "supabase";
  projectScope: "single-project";
  hosting: HostingTarget;
};

export type SetupInput = {
  installation?: InstallationTarget;
  projectName?: string | null; mode: PublishingMode; destination: ContentDestination;
  blogRoute?: string; existingContent?: ExistingContent | null;
  contentPath?: string; loginRoute?: string | null;
  authentication?: "none" | "email-password"; oauth?: boolean;
  assets?: AssetStorage; hosting?: HostingTarget; database?: "none" | "supabase";
};

export const defaultPublishingSetup: PublishingSetup = {
  schemaVersion: 2, installation: "fresh", projectName: "My publication", mode: "local",
  destination: "github", contentPath: "content", blogRoute: "/blog", existingContent: null, loginRoute: null,
  authentication: "none", oauth: false, assets: "repository",
  database: "none", projectScope: "single-project", hosting: "vercel",
};

export function allowedDestinations(mode: PublishingMode): readonly ContentDestination[] {
  if (mode === "local") return ["github"];
  if (mode === "self-hosted") return ["github", "r2"];
  return [];
}

export function createPublishingSetup(input: SetupInput): PublishingSetup {
  // Older schema-v2 links describe fresh starters. Existing sites never export a replacement identity.
  const installation = input.installation ?? "fresh";
  if (installation !== "fresh" && installation !== "existing") throw new Error("Choose a fresh project or an existing website.");
  const projectName = installation === "existing" ? null : typeof input.projectName === "string" ? input.projectName.trim() : "";
  if (installation === "fresh" && (!projectName || projectName.length > 80 || /[\u0000-\u001f\u007f]/.test(projectName))) {
    throw new Error("Use a project name between 1 and 80 characters, without control characters.");
  }
  if (input.mode === "managed") throw new Error("Managed is coming soon. Choose Local or login-based self-hosting.");
  if (input.destination === "supabase") throw new Error("Supabase Storage is coming soon. Choose GitHub or Cloudflare R2.");
  if (!allowedDestinations(input.mode).includes(input.destination)) {
    throw new Error("Local content stays in your repository. Login-based setups support GitHub or Cloudflare R2.");
  }
  const hosting = input.hosting ?? (installation === "existing" ? "existing" : "vercel");
  if (!["vercel", "self-hosted", "existing"].includes(hosting) || (hosting === "existing" && installation !== "existing")) throw new Error("Keep existing hosting for an existing website, or choose Vercel or self-hosted hosting.");
  const local = input.mode === "local";
  const authentication = local ? "none" : "email-password";
  if (input.oauth) throw new Error("OAuth is coming soon. Use email and password for now.");
  if (input.authentication !== undefined && input.authentication !== authentication) throw new Error("Choose the authentication supported by this mode.");
  const database = local ? "none" : "supabase";
  if (input.database !== undefined && input.database !== database) throw new Error("Login-based setups use Supabase Auth, including when content lives on GitHub.");
  const assets = input.assets ?? (input.destination === "r2" ? "r2" : "repository");
  if (!(local ? ["repository"] : input.destination === "r2" ? ["r2"] : ["repository", "r2"]).includes(assets)) {
    throw new Error("Store assets with your content, or choose Cloudflare R2 for a login-based setup.");
  }
  const blogRoute = validateBlogRoute(input.blogRoute ?? "/blog");
  const loginRoute = local ? null : validateLoginRoute(input.loginRoute ?? "/login");
  if (loginRoute && (loginRoute === blogRoute || loginRoute.startsWith(blogRoute + "/") || blogRoute.startsWith(loginRoute + "/"))) throw new Error("Blog and login routes must not overlap.");
  const existingContent = installation === "existing" ? input.existingContent ?? "keep" : null;
  if (existingContent !== null && !["keep", "migrate", "replace"].includes(existingContent)) throw new Error("Choose how to handle existing blog content.");
  if (installation === "fresh" && input.existingContent != null) throw new Error("Existing content choices apply only to an existing website.");
  return {
    schemaVersion: 2, installation, projectName, mode: input.mode, destination: input.destination,
    contentPath: validateContentPath(input.contentPath ?? "content"),
    blogRoute, existingContent, loginRoute,
    authentication, oauth: false, assets, database, hosting, projectScope: "single-project",
  };
}

/** Explicit field selection prevents accidental secret serialization. */
export function serializePublishingSetup(input: SetupInput): string {
  return `${JSON.stringify(createPublishingSetup(input), null, 2)}\n`;
}
