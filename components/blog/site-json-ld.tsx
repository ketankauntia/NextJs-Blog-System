import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * WebSite + Organization structured data. Emitted once, on the home page, so the
 * publisher node every BlogPosting references resolves to a real entity.
 */
export function SiteJsonLd() {
  const sameAs = [siteConfig.social.github, siteConfig.social.x].filter(Boolean);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "en",
        publisher: { "@id": `${siteConfig.url}#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}#organization`,
        name: siteConfig.organization.name,
        url: siteConfig.organization.url,
        logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.organization.logo) },
        ...(sameAs.length > 0 && { sameAs }),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
