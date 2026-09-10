export type WorkspaceRole = "owner" | "admin" | "member";
export type DeploymentBoundary =
  | { mode: "managed" }
  | { mode: "local" | "self-hosted"; workspaceId: string; projectId: string };
export type ProjectRole = "viewer" | "editor" | "publisher" | "manager";
export type ProjectAction = "read" | "edit" | "upload" | "publish" | "export" |
  "manage-members" | "manage-settings" | "delete-project";

const projectActions: Record<ProjectRole, readonly ProjectAction[]> = {
  viewer: ["read"],
  editor: ["read", "edit", "upload"],
  publisher: ["read", "edit", "upload", "publish", "export"],
  manager: ["read", "edit", "upload", "publish", "export", "manage-members", "manage-settings"],
};
const allProjectActions: readonly string[] = [...projectActions.manager, "delete-project"];

export type AccessContext = {
  userId: string;
  workspace: { id: string; userId: string; role: WorkspaceRole; active: boolean } | null;
  projectGrant: { workspaceId: string; projectId: string; userId: string; role: ProjectRole; active: boolean } | null;
};

/** Pure policy, not authentication. Memberships must come from trusted storage.
 * Database RLS and transactional mutation checks are independently required. */
export function canAccessProject(context: AccessContext,
  target: { workspaceId: string; projectId: string; deleted?: boolean }, action: string): boolean {
  const membership = context.workspace;
  if (!context.userId || !target.workspaceId || !target.projectId || target.deleted ||
      !membership?.active || membership.userId !== context.userId ||
      membership.id !== target.workspaceId || !allProjectActions.includes(action)) return false;
  if (membership.role === "owner" || membership.role === "admin") return true;
  if (membership.role !== "member") return false;
  const grant = context.projectGrant;
  if (!grant?.active || grant.userId !== context.userId ||
      grant.workspaceId !== target.workspaceId || grant.projectId !== target.projectId) return false;
  const actions = Object.hasOwn(projectActions, grant.role) ? projectActions[grant.role] : [];
  return actions.includes(action as ProjectAction);
}

export function canManageWorkspace(context: AccessContext, workspaceId: string,
  action: "billing" | "transfer-ownership" | "delete-workspace" | "manage-projects" | "manage-members"): boolean {
  const membership = context.workspace;
  if (!workspaceId || !context.userId || !membership?.active || membership.id !== workspaceId ||
      membership.userId !== context.userId) return false;
  if (["billing", "transfer-ownership", "delete-workspace"].includes(action)) return membership.role === "owner";
  if (["manage-projects", "manage-members"].includes(action)) return membership.role === "owner" || membership.role === "admin";
  return false;
}

/** Apply a trusted installation binding before role inheritance. */
export function canAccessDeploymentProject(
  boundary: DeploymentBoundary,
  context: AccessContext,
  target: { workspaceId: string; projectId: string; deleted?: boolean },
  action: string,
): boolean {
  if (boundary.mode !== "managed") {
    if (boundary.mode !== "local" && boundary.mode !== "self-hosted") return false;
    if (!boundary.workspaceId || !boundary.projectId ||
        boundary.workspaceId !== target.workspaceId || boundary.projectId !== target.projectId) return false;
  }
  return canAccessProject(context, target, action);
}

/** Permission prerequisite only; managed creation also needs an atomic quota check. */
export function canCreateAdditionalProject(
  boundary: DeploymentBoundary, context: AccessContext, workspaceId: string,
): boolean {
  return boundary.mode === "managed" && canManageWorkspace(context, workspaceId, "manage-projects");
}
