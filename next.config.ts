import type { NextConfig } from "next";
import { localContentPath, resolveLocalContent } from "./lib/publishing/local-content.mjs";
import fs from 'node:fs';

// Only these public identity fields enter the browser bundle. Settings changes
// take effect in metadata on the next dev restart / production build.
const publicationEnv: Record<string,string> = {};
const settingsFile=resolveLocalContent('settings.json');
if(fs.existsSync(settingsFile)) {
  if(fs.statSync(settingsFile).size>8192) throw new Error('Publication settings exceed 8 KiB.');
  const settings=JSON.parse(fs.readFileSync(settingsFile,'utf8'));
  for(const [field,variable,limit] of [['publicationName','NEXT_PUBLIC_PUBLICATION_NAME',120],['publicationDescription','NEXT_PUBLIC_PUBLICATION_DESCRIPTION',500]] as const) {
    const value=settings[field];
    if(typeof value==='string'&&value.trim()&&value.length<=limit&&!/[\x00-\x1f\x7f]/.test(value)) publicationEnv[variable]=value.trim();
  }
  if(settings.websiteUrl) {
    const url=new URL(settings.websiteUrl);
    if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash) throw new Error('Publication website must be an HTTPS origin.');
    publicationEnv.NEXT_PUBLIC_SITE_URL=url.origin;
  }
}

const nextConfig: NextConfig = {
  env: publicationEnv,
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
