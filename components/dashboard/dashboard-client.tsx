"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowRight, IconArrowUpRight, IconCalendar, IconCheck, IconChevronLeft,
  IconChevronRight, IconFileText, IconFilter, IconLayoutBoard, IconLink,
  IconList, IconPlus, IconSearch, IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { Input } from "@/components/blog-ui/input";
import { Label } from "@/components/blog-ui/label";
import { Switch } from "@/components/blog-ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/blog-ui/dialog";
import { PostCover } from "@/components/blog/post-cover";
import { SearchableSelect } from "@/components/dashboard/searchable-select";
import { useDebounced } from "@/lib/use-debounced";
import { cn } from "@/lib/utils";
import type { PostRow, PostStatus } from "@/lib/blog/dashboard";
import { DEFAULT_SEO_SCORE_THRESHOLDS, type SeoScoreThresholds } from "@/lib/settings-shared";
import "./content-management.css";

const PER_PAGE = 8;
type ReviewRecord = { reviewedAt: string; nextReviewAt: string };
type Filters = { status: "all" | "review" | PostStatus; category: string; author: string; featuredOnly: boolean; cornerstoneOnly: boolean; noindexOnly: boolean };
const EMPTY_FILTERS: Filters = { status: "all", category: "", author: "", featuredOnly: false, cornerstoneOnly: false, noindexOnly: false };
const STATUS_LABELS: Record<PostStatus, string> = { published: "Published", draft: "Draft", scheduled: "Scheduled" };
const EMPTY_REVIEW: ReviewRecord = { reviewedAt: "", nextReviewAt: "" };

function displayDate(value: string) {
  if (!value) return "Not set";
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}
function isDue(review: ReviewRecord | undefined, today: string) {
  return Boolean(review?.nextReviewAt && review.nextReviewAt <= today);
}

function SeoScoreBadge({ score, thresholds }: { score: number; thresholds: SeoScoreThresholds }) {
  const tone = score <= thresholds.redMax ? "low" : score <= thresholds.yellowMax ? "warn" : "good";
  return <span className={`content-seo-score is-${tone}`} aria-label={`SEO score ${score}`} title="Local editorial checks currently passing">
    <strong>{score}</strong>
  </span>;
}

export function DashboardClient({ rows, readOnly = false, view = "list", initialReviews = {}, today, seoThresholds = DEFAULT_SEO_SCORE_THRESHOLDS }: {
  rows: PostRow[]; readOnly?: boolean; view?: "list" | "board"; initialReviews?: Record<string, ReviewRecord>; today: string; seoThresholds?: SeoScoreThresholds;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sort, setSort] = useState("updated");
  const [rawQuery, setRawQuery] = useState("");
  const query = useDebounced(rawQuery, 200);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [reviewDialog, setReviewDialog] = useState<{ slug: string; markReviewed: boolean; nextReviewAt: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);

  const categories = useMemo(() => [...new Set(rows.map(row => row.category))].sort(), [rows]);
  const authorOptions = useMemo(() => [...new Map(rows.map(row => [row.author, row.authorName]))].map(([value, label]) => ({ value, label })), [rows]);
  const dueCount = rows.filter(row => isDue(reviews[row.slug], today)).length;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(row =>
      (filters.status === "all" || (filters.status === "review" ? isDue(reviews[row.slug], today) : row.status === filters.status)) &&
      (!filters.category || row.category === filters.category) && (!filters.author || row.author === filters.author) &&
      (!filters.featuredOnly || row.featured) && (!filters.cornerstoneOnly || row.cornerstone) && (!filters.noindexOnly || row.noindex) &&
      (!q || [row.title, row.slug, row.category, row.authorName].some(value => value.toLowerCase().includes(q)))
    ).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "review" ? (reviews[a.slug]?.nextReviewAt || "9999").localeCompare(reviews[b.slug]?.nextReviewAt || "9999") : (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt));
  }, [rows, query, filters, sort, reviews, today]);

  const resultKey = JSON.stringify([query, filters, sort]);
  const [lastResultKey, setLastResultKey] = useState(resultKey);
  if (resultKey !== lastResultKey) { setLastResultKey(resultKey); setPage(1); }
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = view === "board" ? filtered : filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const selected = pageRows.find(row => row.slug === selectedSlug) ?? pageRows[0];
  const selectedReview = selected ? reviews[selected.slug] ?? EMPTY_REVIEW : EMPTY_REVIEW;
  const selectedDue = isDue(selectedReview, today);
  const activeCount = Number(Boolean(filters.author)) + Number(filters.featuredOnly) + Number(filters.cornerstoneOnly) + Number(filters.noindexOnly);
  const anyFilters = rawQuery || filters.status !== "all" || filters.category || activeCount > 0;
  const tabs: [Filters["status"], string, number][] = [
    ["all", "All posts", rows.length], ["draft", "Drafts", rows.filter(row => row.status === "draft").length],
    ["published", "Published", rows.filter(row => row.status === "published").length],
    ["scheduled", "Scheduled", rows.filter(row => row.status === "scheduled").length], ["review", "Review due", dueCount],
  ];

  function openReview(slug: string, markReviewed: boolean) {
    const next = reviews[slug]?.nextReviewAt ?? "";
    setFeedback(null);
    setReviewDialog({ slug, markReviewed, nextReviewAt: markReviewed && next <= today ? "" : next });
  }
  async function saveReview() {
    if (!reviewDialog || readOnly) return;
    setSaving(true); setFeedback(null);
    try {
      const response = await fetch(`/api/editor/reviews/${encodeURIComponent(reviewDialog.slug)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markReviewed: reviewDialog.markReviewed, nextReviewAt: reviewDialog.nextReviewAt }),
      });
      const result = await response.json() as { error?: string; review: ReviewRecord };
      if (!response.ok) throw new Error(result.error || "Could not save this review.");
      setReviews(value => ({ ...value, [reviewDialog.slug]: result.review }));
      setReviewDialog(null);
      setFeedback({ error: false, text: "Content review saved to your local project." });
    } catch (error) {
      setFeedback({ error: true, text: error instanceof Error ? error.message : "Could not save this review." });
    } finally { setSaving(false); }
  }
  function resetFilters() { setFilters(EMPTY_FILTERS); setRawQuery(""); }

  return <main id="main-content" className="content-library">
    <div className="content-library-workspace">
      <header className="content-library-heading">
        <div><h1>Content</h1><p>A clear view of what needs your attention.</p></div>
        <Button asChild className="h-10 px-4"><Link href="/dashboard/editor?new=1"><IconPlus className="size-4" />{readOnly ? "Explore editor" : "New post"}</Link></Button>
      </header>

      {dueCount > 0 ? <div className="content-review-banner"><span><i />{dueCount} {dueCount === 1 ? "article ready" : "articles ready"} for review</span><button onClick={() => setFilters(value => ({ ...value, status: "review" }))}>Open review queue <IconArrowRight className="size-4" /></button></div>
        : <div className="content-review-banner content-review-banner-clear"><span><IconCheck className="size-4" />No content reviews due</span><span className="content-review-banner-hint">Set a review date from an article’s details.</span></div>}

      <div className="content-library-viewbar">
        <div className="content-library-tabs" aria-label="Filter articles by status">{tabs.map(([status, label, count]) => <button key={status} type="button" aria-pressed={filters.status === status} onClick={() => setFilters(value => ({ ...value, status }))} className={cn(filters.status === status && "is-active")}>{label}<span>{count}</span></button>)}</div>
        <nav className="content-view-switch" aria-label="Content view"><Link href="/dashboard" aria-current={view === "list" ? "page" : undefined}><IconList className="size-4" />List</Link><Link href="/dashboard/board" aria-current={view === "board" ? "page" : undefined}><IconLayoutBoard className="size-4" />Board</Link></nav>
      </div>
      <div className="content-library-controls">
        <div className="content-search"><IconSearch className="size-4" /><Input value={rawQuery} onChange={event => setRawQuery(event.target.value)} aria-label="Search articles" placeholder="Search articles" /></div>
        <select aria-label="Filter by topic" value={filters.category} onChange={event => setFilters(value => ({ ...value, category: event.target.value }))}><option value="">All topics</option>{categories.map(category => <option key={category}>{category}</option>)}</select>
        <select aria-label="Sort articles" value={sort} onChange={event => setSort(event.target.value)}><option value="updated">Recently updated</option><option value="title">Title A–Z</option><option value="review">Next review</option></select>
        <Button variant="outline" className="h-10" onClick={() => setFiltersOpen(true)}><IconFilter className="size-4" /><span className="sr-only sm:not-sr-only">Filters</span>{activeCount > 0 && <span>{activeCount}</span>}</Button>
        {anyFilters && <Button variant="ghost" className="h-10" onClick={resetFilters}><IconX className="size-4" />Clear</Button>}
      </div>
      {feedback && !reviewDialog && <p role={feedback.error ? "alert" : "status"} className={cn("content-feedback", feedback.error && "is-error")}>{feedback.text}</p>}

      {pageRows.length === 0 ? <div className="content-empty"><IconFileText className="size-8" /><h2>{filters.status === "review" && !anyFilters ? "You’re up to date" : filters.status === "review" && dueCount === 0 ? "You’re up to date" : "No articles found"}</h2><p>{filters.status === "review" && dueCount === 0 ? "No articles are due for review. Schedule the next check from an article’s details." : rows.length ? "Try a different search or clear your filters." : "Start with a draft and make it your own."}</p>{anyFilters ? <Button variant="outline" onClick={resetFilters}>View all articles</Button> : <Button asChild><Link href="/dashboard/editor?new=1">Create your first post</Link></Button>}</div>
        : view === "board" ? <div className="content-board">{(["draft", "scheduled", "published"] as const).map(status => {
          const posts = pageRows.filter(row => row.status === status);
          return <section className="content-board-column" key={status}><h2><PostStatusBadge status={status} /><span>{posts.length}</span></h2>{posts.map(row => <article className={cn("content-board-card", selected?.slug === row.slug && "is-selected")} key={row.slug}><div className="content-board-card-body"><button className="content-board-select" onClick={() => setSelectedSlug(row.slug)} aria-pressed={selected?.slug === row.slug}><span className="content-board-category">{row.category}</span><span className="content-board-date">Updated {displayDate(row.updatedAt || row.publishedAt)}</span></button><h3><Link href={`/dashboard/editor?slug=${row.slug}`}>{row.title}</Link></h3></div><div className="content-board-card-footer"><div className="content-board-card-signals"><SeoScoreBadge score={row.seoScore} thresholds={seoThresholds} /><ReviewBadge review={reviews[row.slug]} today={today} /></div><Link aria-label={`Edit ${row.title}`} href={`/dashboard/editor?slug=${row.slug}`}><IconArrowUpRight className="size-4" /></Link></div></article>)}{!posts.length && <p className="content-board-empty">No {status} articles</p>}{status === "draft" && <Link className="content-board-add" href="/dashboard/editor?new=1"><IconPlus className="size-4" />{readOnly ? "Explore editor" : "Add draft"}</Link>}</section>;
        })}</div> : <div className="content-table-scroll"><table className="content-table"><thead><tr><th>Article</th><th>Status</th><th>SEO</th><th>Review</th><th>Updated</th></tr></thead><tbody>{pageRows.map(row => <tr key={row.slug} className={cn(selected?.slug === row.slug && "is-selected")}><td><div className="content-article-cell"><button type="button" className="content-selection-button" onClick={() => setSelectedSlug(row.slug)} aria-label={`Select ${row.title}`} aria-pressed={selected?.slug === row.slug}><span className="content-selection-dot" aria-hidden="true">{selected?.slug === row.slug ? <IconCheck className="size-3" /> : null}</span></button><span><Link className="content-article-title" href={`/dashboard/editor?slug=${row.slug}`}>{row.title}</Link><small>{row.category}</small></span></div></td><td><PostStatusBadge status={row.status} /></td><td><SeoScoreBadge score={row.seoScore} thresholds={seoThresholds} /></td><td><ReviewBadge review={reviews[row.slug]} today={today} /></td><td className="content-updated">{displayDate(row.updatedAt || row.publishedAt)}</td></tr>)}</tbody></table></div>}

      {view === "list" && filtered.length > 0 && <footer className="content-pagination"><p>Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)} of {filtered.length} articles</p><div><Button variant="outline" size="icon" disabled={current <= 1} onClick={() => setPage(current - 1)} aria-label="Previous page"><IconChevronLeft className="size-4" /></Button><span>{current} / {totalPages}</span><Button variant="outline" size="icon" disabled={current >= totalPages} onClick={() => setPage(current + 1)} aria-label="Next page"><IconChevronRight className="size-4" /></Button></div></footer>}
    </div>

    {selected && <aside className="content-detail" aria-label="Selected article details">
      <p className="content-detail-eyebrow">Selected article</p>
      <PostCover post={selected} className="content-detail-cover" decorative showCategory={false} sizes="(min-width: 1200px) 280px, (min-width: 768px) 320px, 100vw" />
      <h2><Link className="content-detail-title-link" href={`/dashboard/editor?slug=${selected.slug}`}>{selected.title}</Link></h2><p className="content-detail-meta">{selected.category}<span>·</span>{selected.words.toLocaleString()} words</p>
      <div className="content-detail-seo"><SeoScoreBadge score={selected.seoScore} thresholds={seoThresholds} /><span>Local editorial checks passing</span></div>
      <Link className="content-edit-link" href={`/dashboard/editor?slug=${selected.slug}`}>{readOnly ? "Explore article" : "Edit article"}<IconArrowRight className="size-4" /></Link>
      <div className="content-detail-facts"><div><IconFileText className="size-5" /><dl><dt>{selected.status === "scheduled" ? "Scheduled for" : selected.status === "draft" ? "Draft date" : "Published on"}</dt><dd>{displayDate(selected.publishedAt)}</dd></dl></div><div><IconLink className="size-5" /><dl><dt>Article URL</dt><dd>{selected.status === "published" ? <Link className="content-article-url" href={`/blog/post/${selected.slug}`} target="_blank">/blog/post/{selected.slug}<IconArrowUpRight className="size-3" /></Link> : <span>/blog/post/{selected.slug}</span>}</dd></dl></div><div><IconCalendar className="size-5" /><dl><dt>Last updated</dt><dd>{displayDate(selected.updatedAt || selected.publishedAt)}<span className="content-detail-author">by {selected.authorName}</span></dd></dl></div></div>
      <section className={cn("content-review-card", selectedDue && "is-due")}><h3><span className={cn("content-status-dot", selectedDue && "is-warning")} />Content review</h3><p>Check examples, sources, and time-sensitive details.</p><dl>{selectedReview.reviewedAt && <div><dt>Last reviewed</dt><dd>{displayDate(selectedReview.reviewedAt)}</dd></div>}<div><dt>{selectedDue ? "Review due" : "Next review"}</dt><dd>{selectedReview.nextReviewAt ? displayDate(selectedReview.nextReviewAt) : "Not scheduled"}</dd></div></dl>{readOnly ? <p className="content-review-note">Review scheduling is available in your local project.</p> : <><Button className="h-9 px-4" onClick={() => openReview(selected.slug, true)}><IconCheck className="size-4" />Still accurate</Button><button className="content-schedule-review" onClick={() => openReview(selected.slug, false)}>Set next review <IconArrowRight className="size-3.5" /></button></>}</section>
    </aside>}

    <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}><DialogContent><DialogHeader><DialogTitle>Filter content</DialogTitle></DialogHeader><div className="space-y-5"><div className="space-y-2"><Label>Author</Label><SearchableSelect label="authors" value={filters.author} onChange={value => setFilters(current => ({ ...current, author: value }))} options={authorOptions} /></div><div className="space-y-4 rounded-lg border p-4">{([['featuredOnly', 'Featured articles'], ['cornerstoneOnly', 'Cornerstone articles'], ['noindexOnly', 'Excluded from search indexing']] as const).map(([key, label]) => <label className="flex items-center justify-between gap-4 text-sm" key={key}>{label}<Switch checked={filters[key]} onCheckedChange={value => setFilters(current => ({ ...current, [key]: value }))} /></label>)}</div></div><DialogFooter><Button variant="ghost" onClick={() => setFilters(current => ({ ...EMPTY_FILTERS, status: current.status, category: current.category }))}>Clear filters</Button><Button onClick={() => setFiltersOpen(false)}>Show results</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(reviewDialog)} onOpenChange={open => { if (!open && !saving) { setReviewDialog(null); setFeedback(null); } }}><DialogContent><DialogHeader><DialogTitle>{reviewDialog?.markReviewed ? "Confirm content review" : "Schedule content review"}</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{reviewDialog?.markReviewed ? "Confirm that you checked the article’s examples, sources, and time-sensitive details. This records today’s review without changing the article’s publication date." : "Choose when this article should return to the review queue."}</p><div className="space-y-2"><Label htmlFor="next-content-review">Next review date <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="next-content-review" type="date" value={reviewDialog?.nextReviewAt ?? ""} onChange={event => setReviewDialog(value => value ? { ...value, nextReviewAt: event.target.value } : null)} /><p className="text-xs text-muted-foreground">Leave blank to remove the scheduled review. Saved to your local project.</p></div>{feedback?.error && <p role="alert" className="text-sm text-destructive">{feedback.text}</p>}<DialogFooter><Button variant="ghost" disabled={saving} onClick={() => setReviewDialog(null)}>Cancel</Button><Button disabled={saving} onClick={saveReview}>{saving ? "Saving…" : reviewDialog?.markReviewed ? "Confirm review" : "Save review date"}</Button></DialogFooter></DialogContent></Dialog>
  </main>;
}

function PostStatusBadge({ status }: { status: PostStatus }) { return <span className={`content-status content-status-${status}`}><i />{STATUS_LABELS[status]}</span>; }
function ReviewBadge({ review, today }: { review?: ReviewRecord; today: string }) { return <span className={cn("content-review-status", isDue(review, today) && "is-due")}><i />{isDue(review, today) ? "Review due" : review?.nextReviewAt ? displayDate(review.nextReviewAt) : "Not scheduled"}</span>; }
