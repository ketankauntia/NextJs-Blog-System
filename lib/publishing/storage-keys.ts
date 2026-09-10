const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function id(value: string): string {
  if (!uuidPattern.test(value)) throw new Error("Storage identifiers must be UUIDs.");
  return value.toLowerCase();
}
export type StorageScope = { workspaceId: string; projectId: string };

/** Key layout only. Authorize the scope before signing any access. */
export function projectPrefix(scope: StorageScope): string {
  return `workspaces/${id(scope.workspaceId)}/projects/${id(scope.projectId)}`;
}
export function uploadKey(scope: StorageScope, uploadId: string): string {
  return `${projectPrefix(scope)}/uploads/${id(uploadId)}/source`;
}
export function releaseManifestKey(scope: StorageScope, releaseId: string): string {
  return `${projectPrefix(scope)}/releases/${id(releaseId)}/manifest.json`;
}
export function releasePostKey(scope: StorageScope, releaseId: string, postId: string): string {
  return `${projectPrefix(scope)}/releases/${id(releaseId)}/posts/${id(postId)}.md`;
}
export function approvedAssetKey(scope: StorageScope, assetId: string, versionId: string): string {
  return `${projectPrefix(scope)}/assets/${id(assetId)}/${id(versionId)}/optimized.webp`;
}
