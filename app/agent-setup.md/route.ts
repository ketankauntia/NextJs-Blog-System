import { agentSetupMarkdown } from "@/lib/docs-content";
import { buildAgentSetupPrompt } from "@/lib/agent-setup";
import { createPublishingSetup } from "@/lib/publishing/config";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const selection = new URL(request.url).searchParams.get("setup");
  let markdown = agentSetupMarkdown;
  if (selection !== null) {
    try {
      if (selection.length > 4096) throw new Error("Setup link is too long.");
      markdown = buildAgentSetupPrompt(createPublishingSetup(JSON.parse(selection)));
    } catch {
      return new Response("Invalid setup link. Generate a new link from /docs#get-started.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
  }
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": selection ? "private, no-store" : "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
