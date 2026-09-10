import fs from "node:fs";
import path from "node:path";
import {
  BLOG_TEMPLATES,
  FONT_PAIRINGS,
  POST_TEMPLATES,
  DEFAULT_SETTINGS,
  DEFAULT_SEO_SCORE_THRESHOLDS,
  type SeoScoreThresholds,
  type SiteSettings,
} from "@/lib/settings";
import { rejectStudioMutation } from "@/lib/studio-access";
import { resolveLocalContent } from "@/lib/publishing/local-content.mjs";

export const dynamic = "force-dynamic";

function isValidSeoScoreThresholds(value: unknown): value is SeoScoreThresholds {
  if (!value || typeof value !== "object") return false;
  const thresholds = value as Partial<SeoScoreThresholds>;
  const redMax = thresholds.redMax;
  const yellowMax = thresholds.yellowMax;
  return typeof redMax === "number" && typeof yellowMax === "number" &&
    Number.isInteger(redMax) && Number.isInteger(yellowMax) &&
    redMax >= 0 && redMax < yellowMax && yellowMax <= 100;
}

/** Persists dashboard settings to content/settings.json. Dev-only, like post saves. */
export async function POST(req: Request) {
  const rejection = rejectStudioMutation();
  if (rejection) return rejection;

  const body = (await req.json()) as Partial<SiteSettings>;

  if (
    !BLOG_TEMPLATES.includes(body.blogTemplate as never) ||
    !POST_TEMPLATES.includes(body.postTemplate as never)
  ) {
    return Response.json({ error: "Invalid template value" }, { status: 400 });
  }
  // Older settings files predate the font setting, so absence is not an error.
  if (body.fontPairing !== undefined && !FONT_PAIRINGS.includes(body.fontPairing as never)) {
    return Response.json({ error: "Invalid font pairing" }, { status: 400 });
  }
  const seoScoreThresholds = body.seoScoreThresholds ?? DEFAULT_SEO_SCORE_THRESHOLDS;
  if (!isValidSeoScoreThresholds(seoScoreThresholds)) {
    return Response.json({ error: "SEO score thresholds must be whole numbers from 0 to 100, with red below yellow." }, { status: 400 });
  }

  const settings: SiteSettings = {
    blogTemplate: body.blogTemplate!,
    postTemplate: body.postTemplate!,
    fontPairing: body.fontPairing ?? DEFAULT_SETTINGS.fontPairing,
    seoScoreThresholds: {
      redMax: seoScoreThresholds.redMax,
      yellowMax: seoScoreThresholds.yellowMax,
    },
  };
  const target = resolveLocalContent("settings.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    target,
    JSON.stringify(settings, null, 2) + "\n",
    "utf8",
  );
  return Response.json({ ok: true });
}
