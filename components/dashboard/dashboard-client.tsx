"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconEdit,
  IconFilter,
  IconPencilPlus,
  IconSearch,
  IconStarFilled,
  IconCheck,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/blog-ui/select";
import { Button } from "@/components/blog-ui/button";
import { Input } from "@/components/blog-ui/input";
import { Label } from "@/components/blog-ui/label";
import { Switch } from "@/components/blog-ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/blog-ui/dialog";
import { SearchableSelect } from "@/components/dashboard/searchable-select";
import { useDebounced } from "@/lib/use-debounced";
import { cn } from "@/lib/utils";
import type { PostRow, PostStatus } from "@/lib/blog/dashboard";

const PER_PAGE = 20;

const STATUS_STYLE: Record<PostStatus, string> = {
  published: "bg-success/15 text-success border-success/30",
  draft: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-warning/15 text-warning border-warning/30",
};

function scoreTone(score: number) {
  return score >= 80 ? "text-success" : score >= 55 ? "text-warning" : "text-destructive";
}

type Filters = {
  status: "all" | PostStatus;
  category: string;
  author: string;
  featuredOnly: boolean;
  cornerstoneOnly: boolean;
  noindexOnly: boolean;
};

const EMPTY_FILTERS: Filters = {
  status: "all",
  category: "",
  author: "",
  featuredOnly: false,
  cornerstoneOnly: false,
  noindexOnly: false,
};

export function DashboardClient({ rows, readOnly = false, view = "list" }: { rows: PostRow[]; readOnly?: boolean; view?: "list" | "board" }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sort, setSort] = useState("updated");
  const [rawQuery, setRawQuery] = useState("");
  const query = useDebounced(rawQuery, 250);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const categoryOptions = useMemo(
    () => [...new Set(rows.map((r) => r.category))].sort().map((c) => ({ value: c, label: c })),
    [rows],
  );
  const authorOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.author, r.authorName);
    return [...map].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filters.status === "all" || r.status === filters.status) &&
        (filters.category === "" || r.category === filters.category) &&
        (filters.author === "" || r.author === filters.author) &&
        (!filters.featuredOnly || r.featured) &&
        (!filters.cornerstoneOnly || r.cornerstone) &&
        (!filters.noindexOnly || r.noindex) &&
        (q === "" || r.title.toLowerCase().includes(q) || r.slug.includes(q)),
    ).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt));
  }, [rows, query, filters, sort]);

  // Reset to page 1 whenever the result set changes. Adjusting during render
  // rather than in an effect avoids rendering the stale page once first.
  const resultKey = JSON.stringify([query, filters, sort]);
  const [lastResultKey, setLastResultKey] = useState(resultKey);
  if (lastResultKey !== resultKey) {
    setLastResultKey(resultKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const selected = pageRows.find(row => row.slug === selectedSlug) ?? pageRows[0];

  const activeCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.author ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.cornerstoneOnly ? 1 : 0) +
    (filters.noindexOnly ? 1 : 0);

  const stats = useMemo(() => {
    const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.seoScore, 0) / rows.length) : 0;
    return {
      total: rows.length,
      published: rows.filter((r) => r.status === "published").length,
      drafts: rows.filter((r) => r.status === "draft").length,
      scheduled: rows.filter((r) => r.status === "scheduled").length,
      avgScore: avg,
    };
  }, [rows]);

  return (
    <main id="main-content" className="mx-auto w-full max-w-shell flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] tracking-[0.16em] text-primary">
            {readOnly ? "PUBLIC PRODUCT TOUR" : "LOCAL AUTHORING STUDIO"}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{view === "board" ? "Content board" : "All posts"}</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your writing from draft to published.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="button-ink h-10 px-4">
            <Link href="/dashboard/editor">
              <IconPencilPlus className="size-4" />
              {readOnly ? "Explore editor" : "New post"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-7 flex gap-5 overflow-x-auto border-b" aria-label="Filter by post status">
        {([['all', 'All', stats.total], ['draft', 'Drafts', stats.drafts], ['scheduled', 'Scheduled', stats.scheduled], ['published', 'Published', stats.published]] as const).map(([status, label, count]) => (
          <button key={status} type="button" aria-pressed={filters.status === status} onClick={() => setFilters(f => ({ ...f, status }))} className={cn("flex shrink-0 items-center gap-2 border-b-2 px-1 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", filters.status === status ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}<span className="rounded bg-muted px-1.5 text-xs tabular-nums">{count}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            aria-label="Search posts"
            placeholder="Search posts…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => setFiltersOpen(true)}>
          <IconFilter className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{activeCount}</span>
          )}
        </Button>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Sort posts"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="updated">Recently updated</SelectItem><SelectItem value="title">Title A–Z</SelectItem></SelectContent>
        </Select>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
            <IconX className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {view === "board" ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {(['draft', 'scheduled', 'published'] as const).map(status => {
            const posts = filtered.filter(row => row.status === status);
            return <section key={status} aria-label={`${status} posts`} className="min-w-0 rounded-lg border bg-muted/20 p-3">
              <h2 className="mb-4 flex items-center gap-2 px-1 text-sm font-semibold capitalize">{status === 'draft' ? 'Drafts' : status}<span className="rounded bg-muted px-1.5 text-xs tabular-nums">{posts.length}</span></h2>
              <div className="space-y-3">{posts.map(row => <article key={row.slug} className="rounded-md border bg-card p-4">
                <Link href={`/dashboard/editor?slug=${row.slug}`} className="font-medium leading-6 hover:text-primary">{row.title}</Link>
                <p className="mt-2 text-xs text-muted-foreground">{row.category}</p>
                <p className="mt-3 text-xs text-muted-foreground">{status === 'scheduled' ? 'Publishes' : 'Updated'} {status === 'scheduled' ? row.publishedAt : row.updatedAt || row.publishedAt}</p>
                <div className="mt-3 flex items-center justify-between gap-2"><span className={cn("text-xs", scoreTone(row.seoScore))}>SEO {row.seoScore}/100</span><Link href={`/dashboard/editor?slug=${row.slug}`} className="text-xs font-medium text-primary hover:underline">{readOnly ? 'Explore article' : 'Edit article'}</Link></div>
              </article>)}</div>
              {posts.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No {status} posts.</p>}
              {status === 'draft' && <Link href="/dashboard/editor" className="mt-3 flex items-center justify-center gap-2 rounded-md border border-dashed py-4 text-sm text-muted-foreground hover:bg-muted"><IconPencilPlus className="size-4" />{readOnly ? 'Explore editor' : 'Add draft'}</Link>}
            </section>;
          })}
        </div>
      ) : (
        <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground"><tr><th className="px-3 py-3 font-medium">Title</th><th className="px-3 py-3 font-medium">Status</th><th className="hidden px-3 py-3 font-medium sm:table-cell">Updated</th></tr></thead>
              <tbody>{pageRows.map(row => <tr key={row.slug} className={cn("border-b transition-colors hover:bg-muted/40", selected?.slug === row.slug && "bg-primary/5")}>
                <td className={cn("border-l-2 px-3 py-4", selected?.slug === row.slug ? "border-l-primary" : "border-l-transparent")}>
                  <button type="button" onClick={() => setSelectedSlug(row.slug)} aria-pressed={selected?.slug === row.slug} className="block w-full text-left font-medium leading-6 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{row.featured && <IconStarFilled className="mr-1 inline size-3 text-warning" aria-label="Featured" />}{row.title}</button>
                  <p className="mt-1 text-xs text-muted-foreground">{row.category}</p>
                </td>
                <td className="px-3 py-4"><PostStatusBadge status={row.status} /></td>
                <td className="hidden whitespace-nowrap px-3 py-4 text-xs text-muted-foreground sm:table-cell">{row.updatedAt || row.publishedAt}</td>
              </tr>)}</tbody>
            </table>
            {!pageRows.length && <p className="py-16 text-center text-sm text-muted-foreground">No posts match your filters.</p>}
          </div>
          {selected && <aside aria-label="Selected post details" className="min-w-0 border-t pt-6 xl:sticky xl:top-24 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <PostStatusBadge status={selected.status} />
            <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-tight">{selected.title}</h2>
            <p className="mt-2 break-all text-xs text-muted-foreground">/blog/post/{selected.slug}</p>
            <div className="mt-5 flex flex-wrap gap-2"><Button asChild><Link href={`/dashboard/editor?slug=${selected.slug}`}><IconEdit className="size-4" />{readOnly ? 'Explore article' : 'Edit article'}</Link></Button>{selected.status === 'published' && <Button variant="outline" asChild><Link href={`/blog/post/${selected.slug}`} target="_blank"><IconArrowUpRight className="size-4" />Preview</Link></Button>}</div>
            <div className="mt-6 border-t pt-5"><h3 className="text-sm font-semibold">Publishing</h3><dl className="mt-4 space-y-3 text-sm">
              {([['Author', selected.authorName], ['Category', selected.category], ['Last updated', selected.updatedAt || selected.publishedAt], [selected.status === 'scheduled' ? 'Scheduled for' : 'Post date', selected.publishedAt], ['Reading time', `${selected.readingMinutes} min · ${selected.words.toLocaleString()} words`]]).map(([label,value]) => <div key={label} className="grid grid-cols-[110px_1fr] gap-3"><dt className="text-muted-foreground">{label}</dt><dd>{value || 'Not set'}</dd></div>)}
            </dl></div>
            <div className="mt-6 border-t pt-5"><div className="flex justify-between text-sm"><h3 className="font-semibold">Content checks</h3><span className={scoreTone(selected.seoScore)}>SEO {selected.seoScore}/100</span></div><ul className="mt-4 space-y-3">
              {([[Boolean(selected.title && selected.slug), 'Title and URL'], [selected.descriptionLength > 0, 'Meta description'], [selected.hasImage, 'Article image'], [selected.hasKeyphrase, 'Focus keyphrase']] as const).map(([ready,label]) => <li key={label} className="flex items-center gap-2 text-xs">{ready ? <IconCheck className="size-4 shrink-0 text-success" /> : <IconAlertCircle className="size-4 shrink-0 text-warning" />}<span className="flex-1">{label}<span className="sr-only">{ready ? ": present" : ": missing"}</span></span>{!ready && <Link href={`/dashboard/editor?slug=${selected.slug}`} className="text-primary hover:underline">Review</Link>}</li>)}
            </ul></div>
          </aside>}
        </div>
      )}

      {/* Pagination */}
      {view === "list" && filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              Previous
            </Button>
            <span className="tabular-nums text-muted-foreground">
              Page {current} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Filters modal */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <SearchableSelect
                label="statuses"
                value={filters.status === "all" ? "" : filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: (v || "all") as Filters["status"] }))}
                options={[
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "scheduled", label: "Scheduled" },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <SearchableSelect
                label="categories"
                value={filters.category}
                onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
                options={categoryOptions}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <SearchableSelect
                label="authors"
                value={filters.author}
                onChange={(v) => setFilters((f) => ({ ...f, author: v }))}
                options={authorOptions}
              />
            </div>
            <div className="space-y-3 rounded-lg border p-3">
              <FlagToggle
                label="Featured only"
                checked={filters.featuredOnly}
                onChange={(v) => setFilters((f) => ({ ...f, featuredOnly: v }))}
              />
              <FlagToggle
                label="Cornerstone only"
                checked={filters.cornerstoneOnly}
                onChange={(v) => setFilters((f) => ({ ...f, cornerstoneOnly: v }))}
              />
              <FlagToggle
                label="No-index only"
                checked={filters.noindexOnly}
                onChange={(v) => setFilters((f) => ({ ...f, noindexOnly: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear all
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function PostStatusBadge({ status }: { status: PostStatus }) {
  return <span className={cn("inline-block rounded px-2 py-1 text-xs font-medium capitalize", STATUS_STYLE[status])}>{status}</span>;
}

function FlagToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
