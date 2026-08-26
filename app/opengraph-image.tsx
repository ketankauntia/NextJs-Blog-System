import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Site-wide social card. Rendered once at build time — no image asset to keep in the repo. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0b1c1b 0%, #0f2e2b 55%, #134e48 100%)",
          color: "#f5f7f7",
          fontSize: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#2dd4bf",
              color: "#04211f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            {siteConfig.shortName.slice(0, 1)}
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.5 }}>
            {siteConfig.name}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 60, lineHeight: 1.15, letterSpacing: -1.5 }}>
          {siteConfig.description}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8fd6cd" }}>
          {new URL(siteConfig.url).host}
        </div>
      </div>
    ),
    size,
  );
}
