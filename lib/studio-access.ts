import "server-only";

/**
 * The hosted Studio is a public product demo. Filesystem mutations are only
 * allowed while running the project locally in development.
 */
export function canMutateStudio(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Set STUDIO_DEMO_ENABLED=false to hide every Studio route in production. */
export function isStudioVisible(): boolean {
  return canMutateStudio() || process.env.STUDIO_DEMO_ENABLED !== "false";
}

export function rejectStudioMutation(): Response | null {
  if (canMutateStudio()) return null;

  return Response.json(
    {
      error:
        "This hosted Studio is read-only. Clone the repository and run npm run dev to save changes.",
    },
    { status: 403 },
  );
}
