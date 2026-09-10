"use client";

import { cloneElement, isValidElement, useEffect, useId, useMemo, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArticle,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconDeviceFloppy,
  IconExternalLink,
  IconFilePlus,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/blog-ui/badge";
import { DEFAULT_AUTHOR_SLUG } from "@/lib/blog/authors";
import { siteConfig } from "@/lib/site";
import { Button } from "@/components/blog-ui/button";
import { Input } from "@/components/blog-ui/input";
import { Label } from "@/components/blog-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/blog-ui/select";
import { Switch } from "@/components/blog-ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/blog-ui/tabs";
import { Textarea } from "@/components/blog-ui/textarea";
import { FaqSection } from "@/components/blog/faq-section";
import { KeyTakeaways } from "@/components/blog/key-takeaways";
import { PostBody } from "@/components/blog/post-body";
import { PostCover } from "@/components/blog/post-cover";
import { TldrBlock } from "@/components/blog/tldr-block";
import { parseSections, slugify } from "@/lib/blog/parse";
import { runSeoChecks, type SeoCheck } from "@/lib/editor/seo-checks";
import { suggestInternalLinks, type LinkCandidate } from "@/lib/editor/link-suggestions";
import { RichEditor } from "@/components/editor/rich-editor";
import "./editor-workspace.css";
import { buildTitle, buildDescription } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type EditablePost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  author: string;
  featured: boolean;
  draft: boolean;
  cornerstone: boolean;
  noindex: boolean;
  canonical: string;
  coverTone: string;
  coverImage: string;
  coverAlt: string;
  ogImage: string;
  keyphrase: string;
  tldr: string;
  keyTakeaways: string[];
  faqs: { q: string; a: string }[];
  body: string;
};

function blankPost(): EditablePost {
  return {
    slug: "",
    title: "",
    description: "",
    category: "",
    tags: [],
    publishedAt: new Date().toISOString().slice(0, 10),
    updatedAt: "",
    author: DEFAULT_AUTHOR_SLUG,
    featured: false,
    draft: true,
    cornerstone: false,
    noindex: false,
    canonical: "",
    coverTone: "primary",
    coverImage: "",
    coverAlt: "",
    ogImage: "",
    keyphrase: "",
    tldr: "",
    keyTakeaways: [],
    faqs: [],
    body: "## First section\n\nStart writing…",
  };
}

const COVER_TONES = ["primary", "chart-2", "chart-3", "chart-5"] as const;

function normalizeCoverTone(value: string): (typeof COVER_TONES)[number] {
  return (COVER_TONES as readonly string[]).includes(value)
    ? (value as (typeof COVER_TONES)[number])
    : "primary";
}

/** Immutably move an array item from one index to another. */
function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function PostEditor({
  posts,
  authorSlugs,
  canSave,
  initialSlug,
}: {
  posts: EditablePost[];
  authorSlugs: string[];
  canSave: boolean;
  initialSlug?: string;
}) {
  const [draft, setDraft] = useState<EditablePost>(
    initialSlug === "__new__" ? blankPost() : posts.find((p) => p.slug === initialSlug) ?? posts[0] ?? blankPost(),
  );
  const [slugTouched, setSlugTouched] = useState(initialSlug !== "__new__");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [restorable, setRestorable] = useState<EditablePost | null>(null);
  const [editMode, setEditMode] = useState<"rich" | "markdown">("rich");
  const [postRailCollapsed, setPostRailCollapsed] = useState(false);
  const [postQuery, setPostQuery] = useState("");
  const [mobilePane, setMobilePane] = useState("write");
  const [inspectorTab, setInspectorTab] = useState("seo");
  const [savedDraft, setSavedDraft] = useState(draft);
  const latestDraft = useRef(draft);
  useEffect(() => { latestDraft.current = draft; }, [draft]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const [reviewOpen, setReviewOpen] = useState(false);

  const autosaveKey = (slug: string) => `be-editor:autosave:${slug || "__new__"}`;

  // Autosave the working draft to localStorage (debounced) so a crash/refresh can't lose work.
  useEffect(() => {
    if (!dirty || restorable) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(autosaveKey(draft.slug), JSON.stringify(draft));
      } catch {
        /* Ignore quota and private-mode failures. */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [draft, dirty, restorable]);

  // On first mount, offer to restore an autosaved copy of the initially-loaded post if it differs.
  // This runs once and reads an external store. It cannot move into a state
  // initialiser without a hydration mismatch, and it cannot be a useSyncExternalStore
  // snapshot because this same component writes the key on every autosave tick.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(autosaveKey(draft.slug));
      if (saved) {
        const parsed = JSON.parse(saved) as EditablePost;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount read, see above
        if (JSON.stringify(parsed) !== JSON.stringify(draft)) setRestorable(parsed);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sections = useMemo(() => parseSections(draft.body), [draft.body]);
  const checks = useMemo(
    () =>
      runSeoChecks({
        title: draft.title,
        description: draft.description,
        slug: draft.slug,
        keyphrase: draft.keyphrase,
        tldr: draft.tldr,
        keyTakeaways: draft.keyTakeaways,
        faqs: draft.faqs,
        tags: draft.tags,
        body: draft.body,
        updatedAt: draft.updatedAt || draft.publishedAt,
        cornerstone: draft.cornerstone,
      }),
    [draft],
  );

  const filteredPosts = useMemo(() => {
    const query = postQuery.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) =>
      [post.title, post.slug, post.category, ...post.tags].some((value) => value.toLowerCase().includes(query)),
    );
  }, [postQuery, posts]);

  const linkSuggestions = useMemo(
    () =>
      suggestInternalLinks(
        { slug: draft.slug, category: draft.category, tags: draft.tags, body: draft.body },
        posts,
      ),
    [draft.slug, draft.category, draft.tags, draft.body, posts],
  );

  function set<K extends keyof EditablePost>(key: K, value: EditablePost[K]) {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      // Auto-derive slug from title until the slug is edited by hand
      if (key === "title" && !slugTouched) next.slug = slugify(value as string);
      return next;
    });
    setSaveState("idle");
  }

  function loadPost(slug: string) {
    const next = slug === "__new__" ? blankPost() : posts.find((p) => p.slug === slug);
    if (!next) return;
    if (dirty) {
      try { localStorage.setItem(autosaveKey(draft.slug), JSON.stringify(draft)); }
      catch { setSaveState("error"); setSaveMessage("Browser recovery is unavailable. Save before switching articles."); return; }
    }
    setDraft(next);
    setSavedDraft(next);
    setReviewOpen(false);
    setMobilePane("write");
    setSlugTouched(slug !== "__new__");
    setSaveState("idle");
    // Offer to restore an autosave for the post being opened, if it diverges from disk.
    try {
      const saved = localStorage.getItem(autosaveKey(next.slug));
      setRestorable(saved && saved !== JSON.stringify(next) ? (JSON.parse(saved) as EditablePost) : null);
    } catch {
      setRestorable(null);
    }
  }

  function restoreAutosave() {
    if (restorable) setDraft(restorable);
    setRestorable(null);
  }

  /** Flush the current draft to localStorage, then open the full-page preview (which reads it back). */
  function openPreview() {
    const key = draft.slug || "__new__";
    try {
      localStorage.setItem(autosaveKey(draft.slug), JSON.stringify(draft));
    } catch {
      /* ignore */
    }
    window.open(`/dashboard/editor/preview?key=${encodeURIComponent(key)}`, "_blank", "noopener");
  }

  function discardAutosave() {
    try {
      localStorage.removeItem(autosaveKey(draft.slug));
    } catch {
      /* ignore */
    }
    setRestorable(null);
  }

  async function save() {
    setSaveState("saving");
    const { slug, body, ...rest } = draft;
    const frontmatter = {
      title: rest.title,
      description: rest.description,
      category: rest.category,
      tags: rest.tags,
      publishedAt: rest.publishedAt,
      updatedAt: rest.updatedAt,
      author: rest.author,
      featured: rest.featured || undefined,
      draft: rest.draft || undefined,
      cornerstone: rest.cornerstone || undefined,
      noindex: rest.noindex || undefined,
      canonical: rest.canonical || undefined,
      coverTone: rest.coverTone,
      coverImage: rest.coverImage || undefined,
      coverAlt: rest.coverAlt || undefined,
      ogImage: rest.ogImage || undefined,
      keyphrase: rest.keyphrase,
      tldr: rest.tldr,
      keyTakeaways: rest.keyTakeaways,
      faqs: rest.faqs,
    };
    try {
      const res = await fetch(`/api/editor/posts/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frontmatter, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSavedDraft(draft);
      setSaveState("saved");
      setReviewOpen(false);
      setSaveMessage(`Saved to ${data.path}`);
      // Disk is now the source of truth, so drop the autosave shadow copy.
      try {
        if (JSON.stringify(latestDraft.current) === JSON.stringify(draft)) localStorage.removeItem(autosaveKey(slug));
      } catch {
        /* ignore */
      }
    } catch (err) {
      setSaveState("error");
      setSaveMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <main id="main-content" className="editor-workspace" data-pane={mobilePane}>
      <aside aria-label="Post library" className={cn("editor-library hidden shrink-0 border-r lg:flex lg:flex-col", postRailCollapsed ? "w-14" : "w-72")}>
        <div className={cn("flex h-16 items-center border-b", postRailCollapsed ? "justify-center px-2" : "justify-between px-4")}>
          {!postRailCollapsed ? <div><p className="text-sm font-semibold">Post library</p><p className="text-xs text-muted-foreground">{posts.length} entries</p></div> : null}
          <Button type="button" variant="ghost" size="icon" aria-label={postRailCollapsed ? "Expand post library" : "Collapse post library"} title={`${postRailCollapsed ? "Expand" : "Collapse"} post library`} onClick={() => setPostRailCollapsed((value) => !value)}>
            {postRailCollapsed ? <IconLayoutSidebarLeftExpand className="size-4" /> : <IconLayoutSidebarLeftCollapse className="size-4" />}
          </Button>
        </div>
        {postRailCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <Button variant="ghost" size="icon" aria-label="Create blank draft" title="Blank draft" onClick={() => loadPost("__new__")}><IconFilePlus className="size-4" /></Button>
            <Button variant="ghost" size="icon" asChild aria-label="View all posts" title="All posts"><Link href="/dashboard"><IconArticle className="size-4" /></Link></Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 border-b p-3">
              <Button className="w-full justify-start" size="sm" onClick={() => loadPost("__new__")}><IconFilePlus className="size-4" /> New post</Button>
              <label className="relative block">
                <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input value={postQuery} onChange={(event) => setPostQuery(event.target.value)} placeholder="Search posts" className="h-9 pl-8" />
                <span className="sr-only">Search posts</span>
              </label>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Posts">
              <div className="px-2 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{postQuery ? `${filteredPosts.length} matches` : "Recent posts"}</div>
              <ul className="space-y-1">
                {filteredPosts.map((post) => {
                  const active = post.slug === draft.slug;
                  return (
                    <li key={post.slug}>
                      <button type="button" onClick={() => loadPost(post.slug)} aria-current={active ? "page" : undefined} className={cn("group w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", active && "bg-primary/10 text-foreground ring-1 ring-primary/20")}>
                        <span className="flex items-start gap-2">
                          <IconArticle className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground", active && "text-primary")} aria-hidden />
                          <span className="min-w-0 flex-1"><span className="line-clamp-2 block text-sm font-medium leading-snug">{post.title || post.slug}</span><span className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-muted-foreground"><span>{post.category || "Uncategorized"}</span><span aria-hidden>·</span><span>{post.draft ? "Draft" : post.publishedAt > new Date().toISOString().slice(0, 10) ? "Scheduled" : "Public"}</span></span></span>
                          <IconChevronRight className={cn("mt-0.5 size-3.5 shrink-0 opacity-0 group-hover:opacity-100", active && "text-primary opacity-100")} aria-hidden />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </>
        )}
      </aside>

      <div className="editor-work-area">
        <header className="editor-actionbar">
          <span className="editor-save-status" role="status">{saveState === "saving" ? "Saving…" : dirty ? "Unsaved changes" : "Saved locally"}</span>
          <Button variant="ghost" size="sm" onClick={() => setEditMode((mode) => mode === "rich" ? "markdown" : "rich")} aria-label="Toggle Markdown editor">{editMode === "rich" ? "Markdown" : "Rich text"}</Button>
          <Button variant="ghost" size="sm" onClick={openPreview}><IconExternalLink className="size-4" />Preview</Button>
          <Button size="sm" onClick={() => { setReviewOpen(true); setMobilePane("checks"); setInspectorTab("seo"); }}>Review & save</Button>
        </header>

        {(saveState === "saved" || saveState === "error" || restorable) ? (
          <div className="space-y-2 border-b bg-background px-3 py-2 sm:px-4">
            {saveState === "saved" && <p className="text-sm text-primary" role="status">{saveMessage}</p>}
            {saveState === "error" && <p className="text-sm text-destructive" role="alert">{saveMessage}</p>}
            {restorable && <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>Found a browser draft for this post. Restore it?</span><div className="flex gap-2"><Button size="sm" onClick={restoreAutosave}>Restore</Button><Button size="sm" variant="ghost" onClick={discardAutosave}>Discard</Button></div></div>}
          </div>
        ) : null}

        <div className="editor-panels">
              <section aria-labelledby="editor-canvas-title" className="editor-manuscript">
                <div className="editor-writing-content">
                  <Label className="sr-only">Article body</Label>
                  {editMode === "rich" ? (
                    <RichEditor value={draft.body} onChange={(md) => set("body", md)} uploadSlug={draft.slug} canUpload={canSave}>
                      <div className="editor-writing-header">
                        <Textarea id="editor-canvas-title" value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder="Give your story a title" aria-label="Post title" className="editor-title" rows={2} />
                      </div>
                    </RichEditor>
                  ) : (
                    <div className="editor-markdown-mode">
                      <div className="editor-writing-header"><Textarea id="editor-canvas-title" value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder="Give your story a title" aria-label="Post title" className="editor-title" rows={2} /></div>
                      <Textarea value={draft.body} onChange={(event) => set("body", event.target.value)} spellCheck={false} className="min-h-[calc(100svh-18rem)] resize-y font-mono text-sm leading-relaxed" placeholder={"## Section heading\n\nParagraph text...\n\n- list item\n\n:::callout Title\ntext\n:::\n\n:::stat 42% | label"} />
                    </div>
                  )}
                </div>
              </section>
              <aside aria-label="Post inspector" className="editor-inspector">
                <Tabs value={inspectorTab} onValueChange={setInspectorTab} className="h-full gap-0">
                  <div className="editor-inspector-tabs">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="details">Article</TabsTrigger>
                      <TabsTrigger value="blocks">Blocks</TabsTrigger>
                      <TabsTrigger value="search">Search</TabsTrigger>
                      <TabsTrigger value="seo">Review</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="search" className="overflow-y-auto p-5 space-y-5">
                    <div><h2 className="font-semibold">Search appearance</h2><p className="mt-1 text-xs text-muted-foreground">Generated metadata preview. Search engines may show a different title or snippet.</p></div>
                    <Field label="Search description"><Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field>
                    <Field label="Focus topic (optional)"><Input value={draft.keyphrase} onChange={(e) => set("keyphrase", e.target.value)} /></Field>
                    <SerpPreview title={draft.title} slug={draft.slug} description={draft.description} />
                    <FlagToggle label="Hide from search indexes" checked={draft.noindex} onChange={(v) => set("noindex", v)} />
                    <p className="text-xs text-muted-foreground">{draft.noindex ? "This article asks search engines not to index it." : "Indexing is allowed for public articles. Inclusion is decided by search engines."}</p>
                  </TabsContent>
                  <TabsContent value="preview" className="min-h-0 overflow-y-auto p-5 sm:p-6">
                    <div className="mx-auto max-w-3xl space-y-5">
                <div>
                  <Badge variant="secondary">{draft.category || "Category"}</Badge>
                  <h2 className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight">{draft.title || "Untitled post"}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{draft.description || "Add a description in Details to preview the article summary."}</p>
                </div>
                <PostCover post={{ title: draft.title || "Untitled post", category: draft.category || "Category", coverTone: normalizeCoverTone(draft.coverTone), coverImage: draft.coverImage || undefined, coverAlt: draft.coverAlt || undefined, ogImage: draft.ogImage || undefined }} sizes="400px" className="aspect-video w-full" />
                {draft.tldr && <TldrBlock text={draft.tldr} />}
                <KeyTakeaways items={draft.keyTakeaways} />
                <PostBody sections={sections} />
                <FaqSection faqs={draft.faqs.filter((f) => f.q).map((f) => ({ question: f.q, answer: f.a }))} />
              </div>
            </TabsContent>

                  <TabsContent value="details" className="min-h-0 overflow-y-auto p-4 sm:p-5">
                    <div className="mx-auto max-w-3xl space-y-3">
                <InspectorSection title="Publishing" description="Status, ownership, and dates" open>
                  <div className="grid gap-3">
                    <FlagToggle label="Draft" checked={draft.draft} onChange={(v) => set("draft", v)} />
                    <FlagToggle label="Featured" checked={draft.featured} onChange={(v) => set("featured", v)} />
                    <FlagToggle label="Cornerstone" checked={draft.cornerstone} onChange={(v) => set("cornerstone", v)} />
                    <Field label="Author"><Select value={draft.author} onValueChange={(v) => set("author", v)}><SelectTrigger aria-label="Author"><SelectValue /></SelectTrigger><SelectContent>{authorSlugs.map((slug) => <SelectItem key={slug} value={slug}>{slug}</SelectItem>)}</SelectContent></Select></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Published"><Input type="date" value={draft.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} /></Field>
                      <Field label="Updated"><Input type="date" value={draft.updatedAt} onChange={(e) => set("updatedAt", e.target.value)} /></Field>
                    </div>
                  </div>
                </InspectorSection>

                <InspectorSection title="Discovery" description="URL, summary, and search signals">
                  <div className="space-y-3">
                    <Field label="Slug"><Input value={draft.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} placeholder="my-post-slug" /></Field>
                    <Field label={`Meta description (${draft.description.length} characters)`}><Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} className="min-h-24" /></Field>
                    <Field label="Focus keyphrase"><Input value={draft.keyphrase} onChange={(e) => set("keyphrase", e.target.value)} /></Field>
                    <Field label="Category"><Input value={draft.category} onChange={(e) => set("category", e.target.value)} /></Field>
                    <Field label="Tags, comma separated"><Input value={draft.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} /></Field>
                    <Field label="Canonical URL"><Input value={draft.canonical} onChange={(e) => set("canonical", e.target.value)} placeholder="Optional override" /></Field>
                    <FlagToggle label="Hide from search indexes" checked={draft.noindex} onChange={(v) => set("noindex", v)} />
                  </div>
                </InspectorSection>

                <InspectorSection title="Cover and social" description="Visual identity and accessibility">
                  <div className="space-y-3">
                    <Field label="Cover tone"><Select value={draft.coverTone} onValueChange={(v) => set("coverTone", v)}><SelectTrigger aria-label="Cover tone"><SelectValue /></SelectTrigger><SelectContent>{COVER_TONES.map((tone) => <SelectItem key={tone} value={tone}>{tone}</SelectItem>)}</SelectContent></Select></Field>
                    <Field label="Cover image, 1600 by 900"><Input value={draft.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="/blog/post-slug/cover.webp" /></Field>
                    <Field label="Cover alt text"><Input value={draft.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} placeholder="Describe what the image shows" /></Field>
                    <Field label="Social image, 1200 by 630"><Input value={draft.ogImage} onChange={(e) => set("ogImage", e.target.value)} placeholder="/blog/post-slug/social.jpg" /></Field>
                  </div>
                </InspectorSection>
              </div>
            </TabsContent>

                  <TabsContent value="blocks" className="min-h-0 overflow-y-auto p-4 sm:p-5">
                    <div className="mx-auto max-w-3xl space-y-4">
                <InspectorSection title={`TL;DR${draft.tldr ? ` · ${draft.tldr.length} characters` : ""}`} description="A concise answer for readers who are scanning" open>
                  <Textarea aria-label="TL;DR summary" value={draft.tldr} onChange={(e) => set("tldr", e.target.value)} className="min-h-28" />
                </InspectorSection>
                <InspectorSection title={`Key takeaways${draft.keyTakeaways.length ? ` · ${draft.keyTakeaways.length}` : ""}`} description="The points a reader should remember">
                  <Textarea aria-label="Key takeaways, one per line" value={draft.keyTakeaways.join("\n")} onChange={(e) => set("keyTakeaways", e.target.value.split("\n").filter((line) => line.trim()))} className="min-h-28" />
                </InspectorSection>
                <InspectorSection title={`FAQs${draft.faqs.length ? ` · ${draft.faqs.length}` : ""}`} description="Optional questions and complete answers">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Collapse each question while you work through the list.</p><Button variant="outline" size="sm" onClick={() => set("faqs", [...draft.faqs, { q: "", a: "" }])}>Add FAQ</Button></div>
                    {draft.faqs.map((faq, i) => (
                      <details key={i} className="editor-faq-item rounded-xl border" open={i === 0}>
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden"><IconChevronRight className="size-4 text-muted-foreground transition-transform" /><span className="min-w-0 flex-1 truncate">{faq.q || `FAQ ${i + 1}`}</span><button type="button" aria-label={`Remove FAQ ${i + 1}`} onClick={(event) => { event.preventDefault(); set("faqs", draft.faqs.filter((_, j) => j !== i)); }} className="text-muted-foreground hover:text-destructive"><IconTrash className="size-4" /></button></summary>
                        <div className="space-y-2 border-t p-3">
                          <div className="flex gap-2"><div className="flex flex-col"><button type="button" aria-label="Move FAQ up" disabled={i === 0} onClick={() => set("faqs", moveItem(draft.faqs, i, i - 1))} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><IconChevronUp className="size-4" /></button><button type="button" aria-label="Move FAQ down" disabled={i === draft.faqs.length - 1} onClick={() => set("faqs", moveItem(draft.faqs, i, i + 1))} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><IconChevronDown className="size-4" /></button></div><Input value={faq.q} aria-label={`FAQ ${i + 1} question`} placeholder="Reader question" onChange={(e) => set("faqs", draft.faqs.map((item, j) => j === i ? { ...item, q: e.target.value } : item))} /></div>
                          <Textarea value={faq.a} aria-label={`FAQ ${i + 1} answer`} placeholder="A complete standalone answer" className="min-h-24" onChange={(e) => set("faqs", draft.faqs.map((item, j) => j === i ? { ...item, a: e.target.value } : item))} />
                        </div>
                      </details>
                    ))}
                  </div>
                </InspectorSection>
              </div>
            </TabsContent>

                  <TabsContent value="seo" className="min-h-0 overflow-y-auto p-4 sm:p-5">
                    <div className="mx-auto max-w-3xl space-y-5">
                <div><p className="text-xs text-muted-foreground">BEFORE YOU SAVE</p><h2 className="mt-2 text-xl font-semibold">{reviewOpen ? "Review your update" : "A little more clarity."}</h2><p className="mt-2 text-sm text-muted-foreground">Check the details that matter to your readers. These checks do not predict rankings.</p></div>
                {reviewOpen && <div className="space-y-4 rounded-xl border p-4"><PostCover post={{title: draft.title || "Untitled", category: draft.category, coverTone: normalizeCoverTone(draft.coverTone), coverImage: draft.coverImage || undefined, coverAlt: draft.coverAlt || undefined}} className="aspect-video w-full" /><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt>Destination</dt><dd>Local project</dd></div><div className="flex justify-between"><dt>Visibility</dt><dd>{draft.draft ? "Draft" : "Public after deployment"}</dd></div><div className="flex justify-between"><dt>Search indexing</dt><dd>{draft.noindex ? "Disabled" : "Allowed"}</dd></div></dl><Button className="w-full" onClick={save} disabled={!canSave || saveState === "saving" || !draft.slug || !draft.title.trim()}><IconDeviceFloppy className="size-4" />{saveState === "saving" ? "Saving…" : "Save changes"}</Button><p className="text-xs text-muted-foreground">{canSave ? "Writes Markdown to your local project. Commit and deploy to update your live site." : "This demo is read-only. Saving is available in your local project."}</p></div>}
                <SerpPreview title={draft.title} slug={draft.slug} description={draft.description} />
                {(["seo", "structure"] as const).map((group) => (
                  <div key={group}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group === "seo" ? "Search essentials" : "Reader experience"}</p>
                    <ul className="space-y-1.5">{checks.filter((check) => check.group === group).map((check) => <CheckRow key={check.id} check={check} />)}</ul>
                  </div>
                ))}
                <LinkSuggestions suggestions={linkSuggestions} />
              </div>
            </TabsContent>
                </Tabs>
              </aside>

        </div>
      </div>
      <nav className="editor-mobile-nav" aria-label="Editor views">
        {[["write", "Write"], ["details", "Details"], ["checks", "Checks"], ["preview", "Preview"]].map(([value, label]) => <button key={value} type="button" aria-current={mobilePane === value ? "page" : undefined} onClick={() => { setMobilePane(value); if(value === "details") setInspectorTab("details"); if(value === "checks") setInspectorTab("seo"); if(value === "preview") setInspectorTab("preview"); }}>{label}</button>)}
      </nav>
    </main>
  );
}

function InspectorSection({ title, description, open = false, children }: { title: string; description: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group rounded-xl border bg-background">
      <summary className="cursor-pointer list-none px-4 py-3 focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span><span className="block text-sm font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{description}</span></span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="border-t p-4">{children}</div>
    </details>
  );
}

function FlagToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex min-h-8 items-center justify-between gap-3 text-sm"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></label>;
}

function LinkSuggestions({ suggestions }: { suggestions: LinkCandidate[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Internal links to add
      </p>
      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No suggestions. Everything relevant may already be linked, or the draft may need more body text.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {suggestions.map((s) => (
            <li key={s.slug} className="flex items-start justify-between gap-2 rounded-md border p-2 text-sm">
              <div>
                <p className="font-medium leading-tight">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.reason}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(`[${s.title}](/blog/post/${s.slug})`);
                  setCopied(s.slug);
                  setTimeout(() => setCopied(null), 1500);
                }}
              >
                {copied === s.slug ? "Copied" : "Copy link"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id })
    : children;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      {control}
    </div>
  );
}

function CheckRow({ check }: { check: SeoCheck }) {
  const style =
    check.status === "pass"
      ? { border: "border-l-success", icon: <IconCircleCheck className="size-4 shrink-0 text-success" /> }
      : check.status === "warn"
        ? { border: "border-l-warning", icon: <IconAlertTriangle className="size-4 shrink-0 text-warning" /> }
        : { border: "border-l-destructive", icon: <IconCircleX className="size-4 shrink-0 text-destructive" /> };
  return (
    <li className={cn("flex items-start gap-2 rounded-md border border-l-4 p-2 text-sm", style.border)}>
      {style.icon}
      <div>
        <p className="font-medium leading-tight">{check.label}</p>
        <p className="text-xs text-muted-foreground">{check.detail}</p>
      </div>
    </li>
  );
}

const serpHost = (() => {
  try {
    return new URL(siteConfig.url).host;
  } catch {
    return "example.com";
  }
})();

/** Preview how the title, slug, and description truncate in a Google result. */
function SerpPreview({ title, slug, description }: { title: string; slug: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">
        {serpHost} › blog › post › {slug || "slug"}
      </p>
      <p className="mt-1 truncate text-base font-medium text-primary">
        {title ? buildTitle([title]) : `Post title | ${siteConfig.name}`}
      </p>
      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
        {description ? buildDescription(description) : "The meta description will appear here."}
      </p>
    </div>
  );
}
