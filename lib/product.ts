/** Platform identity and public integration options. Never customer canonicals. */
export const productConfig = {
  name: "nextjsblog.com",
  shortName: "nextjsblog.com",
  wordmark: "Next.js Blog System",
  shortWordmark: "Next.js Blog",
  nameSuffix: "System",
  glyph: "N",
  homepageUrl: "https://nextjsblog.com",
  repositoryUrl: "https://github.com/ketankauntia/NextJs-Blog-System",
  routes: { setup: "/docs#get-started", agentSetup: "/agent-setup.md", agentGuide: "/docs/agent-setup" },
  providers: {
    storage: [
      { value: "github", label: "GitHub", description: "Content in your repository.", available: true },
      { value: "supabase", label: "Supabase", description: "Content in Supabase Storage.", available: false },
      { value: "r2", label: "Cloudflare R2", description: "Content, images and uploads.", available: true },
    ],
    database: [
      { value: "supabase", label: "Supabase", description: "PostgreSQL with integrated authentication.", available: true },
      { value: "neon", label: "Neon", description: "Serverless PostgreSQL.", available: false },
      { value: "aws-rds", label: "Amazon RDS", description: "Managed PostgreSQL on AWS.", available: false },
      { value: "gcp-sql", label: "Google Cloud SQL", description: "Managed PostgreSQL on Google Cloud.", available: false },
    ],
    hosting: [
      { value: "vercel", label: "Vercel", description: "Default target for your public Next.js website.", available: true },
      { value: "self-hosted", label: "Self-hosted", description: "Run your website on your own Node.js infrastructure.", available: true },
    ],
    comingSoon: "Coming soon",
  },
  branding: {
    creditPrefix: "Powered by",
  },
} as const;
