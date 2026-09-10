import { rejectStudioMutation } from "@/lib/studio-access";
import { saveContentReview } from "@/lib/blog/reviews.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rejection = rejectStudioMutation();
  if (rejection) return rejection;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Review updates must come from this Studio." }, { status: 403 });
  }
  try {
    const body = await request.text();
    if (body.length > 4096) return Response.json({ error: "Review update is too large." }, { status: 413 });
    const { slug } = await params;
    const review = saveContentReview(slug, JSON.parse(body));
    return Response.json({ ok: true, review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the content review.";
    const status = message === "Article not found." ? 404 : message === "Invalid article URL." || message === "Choose a valid review date." || error instanceof SyntaxError ? 400 : 500;
    return Response.json({ error: status === 500 ? "Could not save the content review. Check your local content folder and reviews.json." : message }, { status });
  }
}
