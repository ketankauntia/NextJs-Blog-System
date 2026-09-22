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
      { value: "r2", label: "Cloudflare R2", description: "Private posts, settings and uploads.", available: true },
      { value: "github", label: "GitHub", description: "Content in your repository.", available: false },
      { value: "supabase", label: "Supabase", description: "Content in Supabase Storage.", available: false },
      { value: "neon", label: "Neon", description: "Postgres-backed content storage.", available: false },
      { value: "aws-s3", label: "Amazon S3", description: "AWS object storage.", available: false },
    ],
    database: [
      { value: "d1", label: "Cloudflare D1", description: "Users, roles and revocable sessions.", available: true },
      { value: "supabase", label: "Supabase", description: "PostgreSQL with integrated authentication.", available: false },
      { value: "neon", label: "Neon", description: "Serverless PostgreSQL.", available: false },
      { value: "aws-rds", label: "Amazon RDS", description: "Managed PostgreSQL on AWS.", available: false },
      { value: "gcp-sql", label: "Google Cloud SQL", description: "Managed PostgreSQL on Google Cloud.", available: false },
    ],
    hosting: [
      { value: "cloudflare", label: "Cloudflare Workers", description: "Required for the login-based Cloudflare stack.", available: true },
      { value: "vercel", label: "Vercel", description: "Default target for your public Next.js website.", available: true },
      { value: "self-hosted", label: "Self-hosted", description: "Run your website on your own Node.js infrastructure.", available: true },
    ],
    comingSoon: "Coming soon",
  },
  branding: {
    creditPrefix: "Powered by",
  },
} as const;
