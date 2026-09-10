import test from "node:test";
import assert from "node:assert/strict";
import { createPublishingSetup, defaultPublishingSetup, serializePublishingSetup } from "../lib/publishing/config.ts";
import { canAccessProject, canManageWorkspace, canAccessDeploymentProject, canCreateAdditionalProject } from "../lib/publishing/permissions.ts";
import { projectPrefix, uploadKey, releaseManifestKey, releasePostKey, approvedAssetKey } from "../lib/publishing/storage-keys.ts";

test("default setup is local GitHub without a database", () => {
  assert.deepEqual(createPublishingSetup(defaultPublishingSetup), defaultPublishingSetup);
});

test("hosting is independent of operating mode and unsupported databases fail closed", () => {
  assert.equal(defaultPublishingSetup.hosting, "vercel");
  assert.equal(createPublishingSetup({ ...defaultPublishingSetup, hosting: "self-hosted" }).mode, "local");
  assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, hosting: "unknown" }));
  for (const database of ["neon", "aws-rds", "gcp-sql", "supabase"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, database }));
  }
  for (const destination of ["aws-s3", "gcp-storage", "azure-blob"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, destination }));
  }
});

test("OSS setups have one project and managed is unavailable", () => {
  for (const mode of ["local", "self-hosted"]) {
    const setup = createPublishingSetup({ projectName: "Project", mode, destination: "github", projectScope: "multi-project" });
    assert.equal(setup.projectScope, "single-project");
  }
  assert.throws(() => createPublishingSetup({ projectName: "Project", mode: "managed", destination: "github" }), /coming soon/);
});

test("login-based content uses GitHub or Supabase and always needs authentication", () => {
  for (const destination of ["github", "supabase"]) {
    const setup = createPublishingSetup({ projectName: "Test", mode: "self-hosted", destination, loginRoute: "/team/sign-in", assets: "r2" });
    assert.equal(setup.database, "supabase");
    assert.equal(setup.authentication, "email-password");
    assert.equal(setup.loginRoute, "/team/sign-in");
    assert.equal(setup.assets, "r2");
    assert.equal(setup.oauth, false);
  }
  for (const destination of ["aws", "azure", "supabase", "r2", "gcp", "__proto__"]) {
    assert.throws(() => createPublishingSetup({ projectName: "Test", mode: "local", destination }));
  }
  assert.throws(() => createPublishingSetup({ projectName: "Test", mode: "invalid", destination: "r2" }));
});

test("paths and authentication cannot bypass setup restrictions", () => {
  for (const contentPath of ["../outside", "/tmp/data", "C:\\blog", "public/blog", "src/data", "data/../posts", "data//blog", "%2e%2e", "node_modules/data", ".git"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, contentPath }));
  }
  assert.equal(createPublishingSetup({ ...defaultPublishingSetup, contentPath: "data\\blog/" }).contentPath, "data/blog");
  const remote = { projectName: "Blog", mode: "self-hosted", destination: "supabase" };
  assert.equal(createPublishingSetup(remote).loginRoute, "/login");
  assert.equal(createPublishingSetup(remote).assets, "supabase");
  for (const loginRoute of ["/", "//evil.com", "https://example.com/login", "/api/login", "/dashboard", "/blog/login", "/docs", "/a?b=c", "/%2e%2e", "/a/../login"]) {
    assert.throws(() => createPublishingSetup({ ...remote, loginRoute }));
  }
  assert.throws(() => createPublishingSetup({ ...remote, oauth: true }));
  assert.throws(() => createPublishingSetup({ ...remote, authentication: "none" }));
  assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, assets: "r2" }));
  const output = JSON.parse(serializePublishingSetup({ ...remote, loginRoute: "/staff/sign-in", contentPath: "data/blog", password: "secret" }));
  assert.equal(output.loginRoute, "/staff/sign-in");
  assert.equal(output.contentPath, "data/blog");
  assert.equal(Object.hasOwn(output, "password"), false);
});

test("setup rejects empty or unsafe names and excludes extra secret fields", () => {
  for (const projectName of [" ", "x".repeat(81), "bad\nname", "bad\u0000name"]) {
    assert.throws(() => createPublishingSetup({ ...defaultPublishingSetup, projectName }));
  }
  const output = JSON.parse(serializePublishingSetup({ ...defaultPublishingSetup, projectName: "  Team  ", secret: "do-not-export" }));
  assert.equal(output.projectName, "Team");
  assert.equal(Object.hasOwn(output, "secret"), false);
});

const target = { workspaceId: "workspace-a", projectId: "project-a" };
function member(role = "viewer") {
  return { userId: "user-a", workspace: { id: "workspace-a", userId: "user-a", role: "member", active: true },
    projectGrant: { ...target, userId: "user-a", role, active: true } };
}

test("project actions follow explicit role boundaries", () => {
  assert.equal(canAccessProject(member(), target, "read"), true);
  for (const action of ["edit", "upload", "publish", "export", "manage-members"]) {
    assert.equal(canAccessProject(member(), target, action), false);
  }
  assert.equal(canAccessProject(member("editor"), target, "upload"), true);
  assert.equal(canAccessProject(member("editor"), target, "publish"), false);
  assert.equal(canAccessProject(member("publisher"), target, "publish"), true);
  assert.equal(canAccessProject(member("publisher"), target, "manage-settings"), false);
  assert.equal(canAccessProject(member("manager"), target, "manage-members"), true);
  assert.equal(canAccessProject(member("manager"), target, "delete-project"), false);
});

test("same-workspace membership cannot access an unassigned project", () => {
  assert.equal(canAccessProject(member("manager"), { ...target, projectId: "project-b" }, "read"), false);
  assert.equal(canAccessProject({ ...member(), projectGrant: null }, target, "read"), false);
});

test("revoked, mismatched and missing memberships deny even with a grant", () => {
  const context = member("manager");
  for (const workspace of [null, { ...context.workspace, active: false }, { ...context.workspace, userId: "user-b" }, { ...context.workspace, id: "workspace-b" }]) {
    assert.equal(canAccessProject({ ...context, workspace }, target, "read"), false);
  }
  assert.equal(canAccessProject({ ...context, projectGrant: { ...context.projectGrant, active: false } }, target, "read"), false);
  assert.equal(canAccessProject({ ...context, projectGrant: { ...context.projectGrant, userId: "user-b" } }, target, "read"), false);
});

test("owners inherit only their own workspace and cannot use unknown actions", () => {
  const context = member();
  context.workspace.role = "owner";
  context.projectGrant = null;
  assert.equal(canAccessProject(context, target, "delete-project"), true);
  assert.equal(canAccessProject(context, { ...target, workspaceId: "workspace-b" }, "read"), false);
  assert.equal(canAccessProject(context, { ...target, deleted: true }, "read"), false);
  assert.equal(canAccessProject(context, target, "grant-superuser"), false);
  assert.equal(canAccessProject(member("__proto__"), target, "read"), false);
});

test("billing and ownership stay owner-only", () => {
  const context = member("manager");
  assert.equal(canManageWorkspace(context, "workspace-a", "billing"), false);
  context.workspace.role = "admin";
  assert.equal(canManageWorkspace(context, "workspace-a", "manage-projects"), true);
  for (const action of ["billing", "delete-workspace", "transfer-ownership"]) {
    assert.equal(canManageWorkspace(context, "workspace-a", action), false);
  }
  context.workspace.role = "owner";
  assert.equal(canManageWorkspace(context, "workspace-a", "billing"), true);
  assert.equal(canManageWorkspace(context, "workspace-b", "billing"), false);
  assert.equal(canManageWorkspace(context, "workspace-a", "unknown"), false);
});

test("single-project owner cannot escape the installation or create another project", () => {
  const context = member("manager");
  context.workspace.role = "owner";
  const boundary = { mode: "self-hosted", ...target };
  assert.equal(canAccessDeploymentProject(boundary, context, target, "publish"), true);
  assert.equal(canAccessDeploymentProject(boundary, context, { ...target, projectId: "project-b" }, "publish"), false);
  assert.equal(canCreateAdditionalProject(boundary, context, "workspace-a"), false);
  assert.equal(canCreateAdditionalProject({ mode: "local", ...target }, context, "workspace-a"), false);
  assert.equal(canCreateAdditionalProject({ mode: "managed" }, context, "workspace-a"), true);
  assert.equal(canCreateAdditionalProject({ mode: "managed" }, context, "workspace-b"), false);
  assert.equal(canCreateAdditionalProject({ mode: "managed" }, member(), "workspace-a"), false);
});

test("instance binding cannot elevate an editor or override revoked membership", () => {
  const boundary = { mode: "self-hosted", ...target };
  assert.equal(canAccessDeploymentProject(boundary, member("editor"), target, "publish"), false);
  const context = member("publisher");
  context.workspace.active = false;
  assert.equal(canAccessDeploymentProject(boundary, context, target, "publish"), false);
  assert.equal(canAccessDeploymentProject({ mode: "unknown" }, member(), target, "read"), false);
});

const ids = ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222", "33333333-3333-4333-8333-333333333333"];
const scope = { workspaceId: ids[0], projectId: ids[1] };

test("keys use stable project scope and separate staging from releases", () => {
  const prefix = `workspaces/${ids[0]}/projects/${ids[1]}`;
  assert.equal(projectPrefix(scope), prefix);
  assert.equal(uploadKey(scope, ids[2]), `${prefix}/uploads/${ids[2]}/source`);
  assert.equal(releaseManifestKey(scope, ids[2]), `${prefix}/releases/${ids[2]}/manifest.json`);
  assert.equal(releasePostKey(scope, ids[2], ids[0]), `${prefix}/releases/${ids[2]}/posts/${ids[0]}.md`);
  assert.equal(approvedAssetKey(scope, ids[0], ids[2]), `${prefix}/assets/${ids[0]}/${ids[2]}/optimized.webp`);
  assert.notEqual(projectPrefix(scope), projectPrefix({ ...scope, projectId: ids[2] }));
});

test("storage keys reject traversal, names, encoded paths and arbitrary URLs", () => {
  for (const value of ["../other", "%2e%2e", "https://example.com", "name@example.com", "", `${ids[2]}/extra`]) {
    assert.throws(() => projectPrefix({ ...scope, projectId: value }));
    assert.throws(() => uploadKey(scope, value));
    assert.throws(() => releasePostKey(scope, ids[2], value));
  }
});
