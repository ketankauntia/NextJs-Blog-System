import type { NextConfig } from "next";
import { localContentPath } from "./lib/publishing/local-content.mjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/dashboard/setup", destination: "/docs#get-started", permanent: true }];
  },
  outputFileTracingIncludes: {
    "/*": ["./publishing.json", `./${localContentPath()}/posts/*.md`, `./${localContentPath()}/settings.json`],
  },
  images: {
    // Local post covers are served from /public; add hosts here if you move assets to a CDN.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  async rewrites() {
    // Every post is also served as raw markdown at /blog/post/<slug>.md for LLM crawlers.
    return [{ source: "/blog/post/:slug.md", destination: "/api/markdown/:slug" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      {
        // Immutable, content-hashed font files.
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
