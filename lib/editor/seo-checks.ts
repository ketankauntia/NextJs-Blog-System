export type CheckStatus = "pass" | "warn" | "fail";

export type SeoCheck = {
  id: string;
  group: "seo" | "geo" | "structure" | "readability";
  label: string;
  status: CheckStatus;
  detail: string;
};

export type DraftInput = {
  title: string;
  description: string;
  slug: string;
  keyphrase: string;
  tldr: string;
  keyTakeaways: string[];
  faqs: { q: string; a: string }[];
  tags: string[];
  body: string;
  /** ISO date (updatedAt || publishedAt) — for the freshness check. Optional. */
  updatedAt?: string;
  /** Pillar page → stricter thresholds. */
  cornerstone?: boolean;
};

/** Local editorial checks; these are not ranking scores or publication gates. */
export function runSeoChecks(draft: DraftInput): SeoCheck[] {
  const checks: SeoCheck[] = [
    {id:"title",group:"seo",label:draft.title.trim() ? "Title is set" : "Add an article title",status:draft.title.trim() ? "pass" : "fail",detail:"Use a clear title that describes this specific article."},
    {id:"slug",group:"seo",label:/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug) ? "URL is ready" : "Set a valid URL slug",status:/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug) ? "pass" : "fail",detail:"Lowercase words separated by hyphens are required by this project."},
    {id:"description",group:"seo",label:draft.description.trim() ? "Description is set" : "Consider a search description",status:draft.description.trim() ? "pass" : "warn",detail:"Summarize the value of this page. There is no required character count; snippets can vary by search."},
    {id:"body",group:"structure",label:draft.body.trim() ? "Article has content" : "Add your article content",status:draft.body.trim() ? "pass" : "warn",detail:"Answer the reader's question fully. There is no minimum word count for search."},
  ];
  const images = [...draft.body.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)];
  if(images.some(image => !image[1].trim())) checks.push({id:"image-alt",group:"structure",label:"Review images without alt text",status:"warn",detail:"Describe meaningful images for readers using assistive technology. Decorative images may use empty alt text."});
  if(draft.faqs.some(faq => !faq.q.trim() || !faq.a.trim())) checks.push({id:"faq-incomplete",group:"structure",label:"Finish or remove incomplete FAQs",status:"warn",detail:"FAQs are optional. Keep only questions and answers that help readers."});
  if(/^# /m.test(draft.body)) checks.push({id:"heading",group:"structure",label:"Review the heading hierarchy",status:"warn",detail:"The article title is already a level-one heading. Use level-two headings for its main sections."});
  return checks;
}

/** Compatibility helper for existing consumers; never presented as a ranking prediction. */
export function seoScore(checks: SeoCheck[]): number {
  return checks.length ? Math.round(checks.filter(check => check.status === "pass").length / checks.length * 100) : 0;
}
