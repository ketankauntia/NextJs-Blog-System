import { validateContentPath, validateLoginRoute } from "./paths.mjs";

export type PublishingMode = "local" | "self-hosted" | "managed";
export type ContentDestination = "github" | "supabase";
export type HostingTarget = "vercel" | "self-hosted";
export type AssetStorage = "repository" | "supabase" | "r2";

/** Portable, non-secret installation choices. Provider selection does not connect an account. */
export type PublishingSetup = {
  schemaVersion: 2;
  projectName: string;
  mode: PublishingMode;
  destination: ContentDestination;
  contentPath: string;
  loginRoute: string | null;
  authentication: "none" | "email-password";
  oauth: false;
  assets: AssetStorage;
  database: "none" | "supabase";
  projectScope: "single-project";
  hosting: HostingTarget;
};

export type SetupInput = {
  projectName: string; mode: PublishingMode; destination: ContentDestination;
  contentPath?: string; loginRoute?: string | null;
  authentication?: "none" | "email-password"; oauth?: boolean;
  assets?: AssetStorage; hosting?: HostingTarget; database?: "none" | "supabase";
};

export const defaultPublishingSetup: PublishingSetup = {
  schemaVersion: 2, projectName: "My publication", mode: "local",
  destination: "github", contentPath: "content", loginRoute: null,
  authentication: "none", oauth: false, assets: "repository",
  database: "none", projectScope: "single-project", hosting: "vercel",
};

export function allowedDestinations(mode: PublishingMode): readonly ContentDestination[] {
  if (mode === "local") return ["github"];
  if (mode === "self-hosted") return ["github", "supabase"];
  return [];
}

export function createPublishingSetup(input: SetupInput): PublishingSetup {
  const projectName = input.projectName.trim();
  if (!projectName || projectName.length > 80 || /[\u0000-\u001f\u007f]/.test(projectName)) {
    throw new Error("Use a project name between 1 and 80 characters, without control characters.");
  }
  if (input.mode === "managed") throw new Error("Managed is coming soon. Choose Local or login-based self-hosting.");
  if (!allowedDestinations(input.mode).includes(input.destination)) {
    throw new Error("Local content stays in your repository. Login-based setups support GitHub or Supabase Storage.");
  }
  const hosting = input.hosting ?? "vercel";
  if (hosting !== "vercel" && hosting !== "self-hosted") throw new Error("Choose Vercel or self-hosted hosting.");
  const local = input.mode === "local";
  const authentication = local ? "none" : "email-password";
  if (input.oauth) throw new Error("OAuth is coming soon. Use email and password for now.");
  if (input.authentication !== undefined && input.authentication !== authentication) throw new Error("Choose the authentication supported by this mode.");
  const database = local ? "none" : "supabase";
  if (input.database !== undefined && input.database !== database) throw new Error("Login-based setups use Supabase Auth, including when content lives on GitHub.");
  const assets = input.assets ?? (local || input.destination === "github" ? "repository" : "supabase");
  if (!(local ? ["repository"] : [input.destination === "github" ? "repository" : "supabase", "r2"]).includes(assets)) {
    throw new Error("Store assets with your content, or choose Cloudflare R2 for a login-based setup.");
  }
  return {
    schemaVersion: 2, projectName, mode: input.mode, destination: input.destination,
    contentPath: validateContentPath(input.contentPath ?? "content"),
    loginRoute: local ? null : validateLoginRoute(input.loginRoute ?? "/login"),
    authentication, oauth: false, assets, database, hosting, projectScope: "single-project",
  };
}

/** Explicit field selection prevents accidental secret serialization. */
export function serializePublishingSetup(input: SetupInput): string {
  return `${JSON.stringify(createPublishingSetup(input), null, 2)}\n`;
}
