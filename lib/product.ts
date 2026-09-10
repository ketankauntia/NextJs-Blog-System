/** Platform identity and public integration options. Never customer canonicals. */
export const productConfig = {
  name: "Next.js Blog System",
  shortName: "Next.js Blog",
  nameSuffix: "System",
  glyph: "N",
  homepageUrl: "https://nextjsblogs.com",
  homepageIsPlaceholder: true,
  repositoryUrl: "https://github.com/ketankauntia/NextJs-Blog-System",
  routes: { setup: "/dashboard/setup", agentSetup: "/agent-setup.md", agentGuide: "/docs/agent-setup" },
  providers: {
    storage: [
      { value: "github", label: "GitHub", description: "Markdown and images in your repository.", available: true },
      { value: "supabase", label: "Supabase Storage", description: "Content and uploads in your own Supabase project.", available: true },
      { value: "aws-s3", label: "AWS S3", description: "Amazon object storage.", available: false },
      { value: "gcp-storage", label: "Google Cloud Storage", description: "Google Cloud object storage.", available: false },
      { value: "azure-blob", label: "Azure Blob Storage", description: "Microsoft Azure object storage.", available: false },
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
    linkRel: "nofollow",
  },
} as const;
