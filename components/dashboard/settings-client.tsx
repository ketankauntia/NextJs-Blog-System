"use client";
import {useUnsavedChanges} from '@/lib/use-unsaved-changes';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconEye,
  IconTypography,
} from "@tabler/icons-react";
import { Button } from "@/components/blog-ui/button";
import { Input } from "@/components/blog-ui/input";
import { cn } from "@/lib/utils";
import {
  BLOG_TEMPLATES,
  POST_TEMPLATES,
  type BlogTemplate,
  type PostTemplate,
  type SiteSettings,
} from "@/lib/settings-shared";

const BLOG_META: Record<BlogTemplate, { name: string; blurb: string }> = {
  classic: { name: "Classic", blurb: "Featured card on top, clean card grid below. The all-rounder." },
  magazine: { name: "Magazine", blurb: "Full-width cover hero, editorial secondary stories, compact list." },
  minimal: { name: "Minimal", blurb: "Text-first list. No imagery, so titles and ideas do the talking." },
  journal: { name: "Journal", blurb: "Serif headlines, a split feature and compact story columns. Listing only." },
};

const POST_META: Record<PostTemplate, { name: string; blurb: string }> = {
  standard: { name: "Standard", blurb: "Reading column with a sticky TOC + actions sidebar." },
  centered: { name: "Centered", blurb: "One distraction-free centered column. TOC inline." },
  hero: { name: "Hero", blurb: "Full-width cover banner with overlaid title, then a centered column." },
};

type SettingsCategory = "publication" | "templates" | "seo";

export function SettingsClient({ initial, canSave }: { initial: SiteSettings; canSave: boolean }) {
  const router = useRouter();
  const [blogTemplate, setBlogTemplate] = useState<BlogTemplate>(initial.blogTemplate);
  const [postTemplate, setPostTemplate] = useState<PostTemplate>(initial.postTemplate);
  const [seoRedMax, setSeoRedMax] = useState(initial.seoScoreThresholds.redMax);
  const [seoYellowMax, setSeoYellowMax] = useState(initial.seoScoreThresholds.yellowMax);
  const [publicationName, setPublicationName] = useState(initial.publicationName);
  const [publicationDescription, setPublicationDescription] = useState(initial.publicationDescription);
  const [defaultAuthor, setDefaultAuthor] = useState(initial.defaultAuthor);
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);
  const [dashboardAccess, setDashboardAccess] = useState(initial.dashboardAccess);
  const [category, setCategory] = useState<SettingsCategory>("templates");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const thresholdsValid = Number.isInteger(seoRedMax) && Number.isInteger(seoYellowMax) && seoRedMax >= 0 && seoRedMax < seoYellowMax && seoYellowMax <= 100;
  const dirty = blogTemplate !== initial.blogTemplate || postTemplate !== initial.postTemplate || seoRedMax !== initial.seoScoreThresholds.redMax || seoYellowMax !== initial.seoScoreThresholds.yellowMax || publicationName !== initial.publicationName || publicationDescription !== initial.publicationDescription || defaultAuthor !== initial.defaultAuthor || websiteUrl !== initial.websiteUrl || dashboardAccess !== initial.dashboardAccess;
  useUnsavedChanges(dirty);

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/editor/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Spread `initial` so saving one category cannot drop another setting.
        body: JSON.stringify({ ...initial, publicationName, publicationDescription, defaultAuthor, websiteUrl, dashboardAccess, blogTemplate, postTemplate, seoScoreThresholds: { redMax: seoRedMax, yellowMax: seoYellowMax } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setState("saved");
      setMessage(data.restartRequired ? "Saved. Restart npm run dev to refresh publication metadata. Commit and redeploy to update your live site." : "Saved. Your settings are now active.");
      router.refresh();
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-shell flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <IconArrowLeft className="size-4" /> Dashboard
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure layouts and the signals your content team uses to review articles.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/fonts">
              <IconTypography className="size-4" />
              Typography
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/preview">
              <IconEye className="size-4" />
              Preview themes
            </Link>
          </Button>
          <Button onClick={save} disabled={!canSave || !dirty || !thresholdsValid || state === "saving"}>
            <IconDeviceFloppy className="size-4" />
            {state === "saving" ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {!canSave && (
        <p className="mt-2 text-sm text-muted-foreground">Read-only: settings can be changed in development only.</p>
      )}
      {state === "saved" && <p className="mt-2 text-sm text-success">{message}</p>}
      {state === "error" && <p className="mt-2 text-sm text-destructive">{message}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings categories" className="h-fit rounded-xl border bg-card p-2 lg:sticky lg:top-6">
          <p className="px-3 pb-2 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Settings</p>
          <button type="button" onClick={() => setCategory("templates")} aria-pressed={category === "templates"} className={cn("flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors", category === "templates" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}>
            <span className="text-sm font-medium">Templates</span>
            <span className="mt-0.5 text-xs text-muted-foreground">Blog and article layouts</span>
          </button>
          <button type="button" onClick={() => setCategory("publication")} aria-pressed={category === "publication"} className={cn("mt-1 flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors", category === "publication" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}>
            <span className="text-sm font-medium">Publication</span>
            <span className="mt-0.5 text-xs text-muted-foreground">Identity and dashboard access</span>
          </button>
          <button type="button" onClick={() => setCategory("seo")} aria-pressed={category === "seo"} className={cn("mt-1 flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors", category === "seo" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}>
            <span className="text-sm font-medium">SEO score colors</span>
            <span className="mt-0.5 text-xs text-muted-foreground">Dashboard score bands</span>
          </button>
        </nav>

        <div className="min-w-0">
        {category === "publication" ? <PublicationSettings publicationName={publicationName} publicationDescription={publicationDescription} defaultAuthor={defaultAuthor} websiteUrl={websiteUrl} dashboardAccess={dashboardAccess} onName={setPublicationName} onDescription={setPublicationDescription} onAuthor={setDefaultAuthor} onWebsite={setWebsiteUrl} onAccess={setDashboardAccess} /> : category === "templates" ? <>
      <section>
        <h2 className="font-heading text-lg font-semibold">Blog listing template</h2>
        <p className="text-sm text-muted-foreground">Layout of /blog and its pagination pages.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BLOG_TEMPLATES.map((t) => (
            <TemplateCard
              key={t}
              name={BLOG_META[t].name}
              blurb={BLOG_META[t].blurb}
              selected={blogTemplate === t}
              onSelect={() => setBlogTemplate(t)}
            >
              <BlogThumb template={t} />
            </TemplateCard>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold">Post template</h2>
        <p className="text-sm text-muted-foreground">Layout of individual article pages.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {POST_TEMPLATES.map((t) => (
            <TemplateCard
              key={t}
              name={POST_META[t].name}
              blurb={POST_META[t].blurb}
              selected={postTemplate === t}
              onSelect={() => setPostTemplate(t)}
            >
              <PostThumb template={t} />
            </TemplateCard>
          ))}
        </div>
      </section>
        </> : <SeoScoreSettings
          redMax={seoRedMax}
          yellowMax={seoYellowMax}
          onRedMaxChange={setSeoRedMax}
          onYellowMaxChange={setSeoYellowMax}
          valid={thresholdsValid}
        />}
        </div>
      </div>
    </main>
  );
}

function PublicationSettings({
  publicationName, publicationDescription, defaultAuthor, websiteUrl, dashboardAccess,
  onName, onDescription, onAuthor, onWebsite, onAccess,
}: {
  publicationName: string; publicationDescription: string; defaultAuthor: string; websiteUrl: string; dashboardAccess: "local" | "login";
  onName: (v: string) => void; onDescription: (v: string) => void; onAuthor: (v: string) => void; onWebsite: (v: string) => void; onAccess: (v: "local" | "login") => void;
}) {
  return <div className="space-y-10">
    <section>
      <h2 className="font-heading text-lg font-semibold">Publication identity</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">These values appear in your blog navigation, metadata and new post defaults.</p>
      <div className="mt-5 grid max-w-2xl gap-4">
        <label className="text-sm font-medium">Publication name<Input value={publicationName} maxLength={120} placeholder="Your project name" onChange={e => onName(e.target.value)} /><span className="mt-1 block text-xs font-normal text-muted-foreground">Defaults to your project name. Clicking it always returns to your website homepage.</span></label>
        <label className="text-sm font-medium">Description<Input value={publicationDescription} maxLength={500} placeholder="What will readers find here?" onChange={e => onDescription(e.target.value)} /><span className="mt-1 block text-xs font-normal text-muted-foreground">Optional summary for the blog page and sharing previews.</span></label>
        <label className="text-sm font-medium">Default author<Input value={defaultAuthor} maxLength={120} placeholder={publicationName || "Your name"} onChange={e => onAuthor(e.target.value)} /><span className="mt-1 block text-xs font-normal text-muted-foreground">Used when a post does not specify an author.</span></label>
        <label className="text-sm font-medium">Website address<Input type="url" value={websiteUrl} placeholder="https://example.com" onChange={e => onWebsite(e.target.value)} /><span className="mt-1 block text-xs font-normal text-muted-foreground">HTTPS origin used for canonical links, RSS and sitemap in production.</span></label>
      </div>
    </section>
    <section>
      <h2 className="font-heading text-lg font-semibold">Dashboard access</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Local development is active in this release. A hosted login dashboard is planned for a future version.</p>
      <div className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onAccess("local")} aria-pressed={dashboardAccess === "local"} className={cn("rounded-xl border p-4 text-left", dashboardAccess === "local" ? "border-primary ring-2 ring-primary/20" : "border-border")}><strong className="block text-sm">Local development</strong><span className="mt-1 block text-xs text-muted-foreground">Active. Run <code>npm run dev</code> and open Studio.</span></button>
        <button type="button" disabled title="Available in a future release" aria-pressed={dashboardAccess === "login"} className={cn("rounded-xl border p-4 text-left", dashboardAccess === "login" ? "border-warning ring-2 ring-warning/20" : "border-border")}><strong className="block text-sm">Login dashboard</strong><span className="mt-1 block text-xs text-muted-foreground">Coming next version. Email/password, sessions and deployment setup are not active yet.</span></button>
      </div>
      {dashboardAccess === "login" && <p className="mt-3 max-w-2xl rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm">This selection is saved as a reminder only. Login is unavailable until a future release; no credentials are collected or stored.</p>}
    </section>
  </div>;
}

function SeoScoreSettings({
  redMax,
  yellowMax,
  onRedMaxChange,
  onYellowMaxChange,
  valid,
}: {
  redMax: number;
  yellowMax: number;
  onRedMaxChange: (value: number) => void;
  onYellowMaxChange: (value: number) => void;
  valid: boolean;
}) {
  return (
    <section>
      <h2 className="font-heading text-lg font-semibold">SEO score colors</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
        Choose the score bands used in the Content dashboard. These colors describe local editorial checks; they do not predict search rankings.
      </p>

      <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="rounded-xl border bg-card p-4">
          <span className="flex items-center gap-2 text-sm font-medium"><i className="size-2.5 rounded-full bg-destructive" />Red through</span>
          <span className="mt-3 flex items-center gap-2">
            <Input type="number" min={0} max={99} step={1} value={redMax} onChange={event => onRedMaxChange(Number(event.target.value))} aria-label="Red score upper bound" />
            <span className="text-sm text-muted-foreground">/ 100</span>
          </span>
          <span className="mt-2 block text-xs text-muted-foreground">Scores from 0 to this value need attention.</span>
        </label>

        <label className="rounded-xl border bg-card p-4">
          <span className="flex items-center gap-2 text-sm font-medium"><i className="size-2.5 rounded-full bg-warning" />Yellow through</span>
          <span className="mt-3 flex items-center gap-2">
            <Input type="number" min={1} max={100} step={1} value={yellowMax} onChange={event => onYellowMaxChange(Number(event.target.value))} aria-label="Yellow score upper bound" />
            <span className="text-sm text-muted-foreground">/ 100</span>
          </span>
          <span className="mt-2 block text-xs text-muted-foreground">Scores above red through this value are on watch.</span>
        </label>
      </div>

      <div className={cn("mt-5 rounded-xl border px-4 py-3 text-sm", valid ? "border-border bg-muted/30" : "border-destructive/40 bg-destructive/5 text-destructive")} role={valid ? "status" : "alert"}>
        {valid ? <>Current bands: <strong className="text-destructive">0–{redMax} red</strong>, <strong className="text-warning">{redMax + 1}–{yellowMax} yellow</strong>, <strong className="text-success">{yellowMax + 1}–100 green</strong>.</> : "Choose whole numbers where red is lower than yellow, between 0 and 100."}
      </div>
    </section>
  );
}

function TemplateCard({
  name,
  blurb,
  selected,
  onSelect,
  children,
}: {
  name: string;
  blurb: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/50",
        selected && "border-primary ring-2 ring-primary/30",
      )}
    >
      <div className="relative overflow-hidden rounded-lg border bg-background p-2">
        {children}
        {selected && (
          <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IconCheck className="size-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2.5 font-heading text-sm font-semibold">{name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{blurb}</p>
    </button>
  );
}

/* ---------- CSS mockup thumbnails ---------- */

function BlogThumb({ template }: { template: BlogTemplate }) {
  if (template === "journal") {
    return (
      <div className="space-y-2 py-1">
        <div className="grid grid-cols-2 gap-2 border-b pb-2">
          <div className="h-14 bg-foreground/85" />
          <div className="space-y-1.5 pt-1">
            <div className="h-1 w-1/2 bg-muted-foreground/50" />
            <div className="h-3 bg-foreground/70" />
            <div className="h-3 w-4/5 bg-foreground/70" />
            <div className="h-1 w-1/3 bg-primary" />
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1 px-1 first:pl-0 last:pr-0">
              <div className="h-8 w-2/5 shrink-0 bg-muted" />
              <div className="flex-1 space-y-1 pt-1">
                <div className="h-1.5 bg-foreground/60" />
                <div className="h-1.5 bg-foreground/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (template === "magazine") {
    return (
      <div className="space-y-1.5">
        <div className="flex h-14 items-end rounded bg-primary/70 p-1.5">
          <div className="h-2 w-2/3 rounded-sm bg-background/90" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-8 rounded bg-muted" />
          <div className="h-8 rounded bg-muted" />
        </div>
        <div className="space-y-1">
          <div className="h-3 rounded bg-muted/70" />
          <div className="h-3 rounded bg-muted/70" />
        </div>
      </div>
    );
  }
  if (template === "minimal") {
    return (
      <div className="space-y-2 py-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1 border-b border-border/60 pb-2 last:border-0 last:pb-0">
            <div className="h-1.5 w-1/4 rounded-sm bg-muted" />
            <div className="h-2.5 w-4/5 rounded-sm bg-foreground/60" />
            <div className="h-1.5 w-3/5 rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="flex h-10 gap-1.5 rounded bg-muted p-1.5">
        <div className="w-2/5 rounded-sm bg-primary/60" />
        <div className="flex-1 space-y-1 pt-0.5">
          <div className="h-2 rounded-sm bg-foreground/50" />
          <div className="h-1.5 w-2/3 rounded-sm bg-muted-foreground/40" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}

function PostThumb({ template }: { template: PostTemplate }) {
  if (template === "centered") {
    return (
      <div className="flex justify-center py-1">
        <div className="w-3/5 space-y-1.5">
          <div className="h-2.5 rounded-sm bg-foreground/60" />
          <div className="h-8 rounded bg-primary/60" />
          <div className="h-1.5 rounded-sm bg-muted" />
          <div className="h-1.5 rounded-sm bg-muted" />
          <div className="h-1.5 w-3/4 rounded-sm bg-muted" />
        </div>
      </div>
    );
  }
  if (template === "hero") {
    return (
      <div className="space-y-1.5">
        <div className="flex h-10 items-end rounded bg-primary/70 p-1.5">
          <div className="h-2 w-1/2 rounded-sm bg-background/90" />
        </div>
        <div className="flex justify-center">
          <div className="w-3/5 space-y-1">
            <div className="h-1.5 rounded-sm bg-muted" />
            <div className="h-1.5 rounded-sm bg-muted" />
            <div className="h-1.5 w-3/4 rounded-sm bg-muted" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-1.5 py-1">
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-4/5 rounded-sm bg-foreground/60" />
        <div className="h-7 rounded bg-primary/60" />
        <div className="h-1.5 rounded-sm bg-muted" />
        <div className="h-1.5 w-5/6 rounded-sm bg-muted" />
      </div>
      <div className="w-1/4 space-y-1">
        <div className="h-1.5 rounded-sm bg-muted" />
        <div className="h-1.5 rounded-sm bg-muted" />
        <div className="h-1.5 rounded-sm bg-muted" />
      </div>
    </div>
  );
}
