import { agentSetupMarkdown } from "@/lib/docs-content";

export const dynamic = "force-static";

export function GET() {
  return new Response(agentSetupMarkdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
