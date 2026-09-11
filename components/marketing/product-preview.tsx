"use client";

import Link from "next/link";
import {
  IconArrowUpRight,
  IconBold,
  IconCheck,
  IconChevronRight,
  IconCode,
  IconFileText,
  IconGitBranch,
  IconHeading,
  IconItalic,
  IconLayout,
  IconLink,
  IconList,
  IconPhoto,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/blog-ui/tabs";

type PreviewPost = {
  title: string;
  slug: string;
  category: string;
  description: string;
  tldr: string;
  readingMinutes: number;
  headings: string[];
};

/** A labelled product illustration. Only tabs and destination links are interactive. */
export function ProductPreview({
  post,
}: {
  post: PreviewPost;
}) {
  return (
    <figure className="product-preview">
      <Tabs defaultValue="write" className="preview-tabs">
        <div className="preview-topline">
          <TabsList
            className="preview-tab-list"
            aria-label="Publishing workflow"
          >
            <TabsTrigger value="write">
              <IconFileText aria-hidden />
              Write
            </TabsTrigger>
            <TabsTrigger value="read">
              <IconLayout aria-hidden />
              Read
            </TabsTrigger>
            <TabsTrigger value="publish">
              <IconGitBranch aria-hidden />
              Publish
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="preview-stage">
          <TabsContent
            value="write"
            className="preview-panel preview-panel-write"
          >
            <div className="studio-illustration">
              <div className="preview-sidebar" aria-hidden="true">
                <div className="preview-workspace">
                  <span className="brand-glyph">N</span>
                  <span>
                    Your workspace<small>Personal publication</small>
                  </span>
                </div>
                <div className="preview-nav-item selected">
                  <IconFileText />
                  Content
                </div>
                <div className="preview-nav-item">
                  <IconLayout />
                  Appearance
                </div>
                <div className="preview-nav-item">
                  <IconSettings />
                  Settings
                </div>
                <div className="preview-sidebar-label">YOUR PUBLICATION</div>
                <div className="preview-file selected">{post.title}</div>
                <div className="preview-file">
                  The decisions behind good design
                </div>
                <div className="preview-file">A note on building in public</div>
                <div className="preview-sidebar-footer">
                  <span className="status-dot" />
                  Local workspace
                </div>
              </div>
              <div className="preview-editor">
                <div className="preview-editor-bar">
                  <span>
                    Content
                    <IconChevronRight className="size-3.5" />
                    Edit article
                  </span>
                  <span className="preview-saved">
                    <IconCheck className="size-3.5" />
                    Markdown source
                  </span>
                </div>
                <div className="preview-editor-toolbar" aria-hidden="true">
                  <span>Paragraph</span>
                  <i />
                  <IconBold />
                  <IconItalic />
                  <IconHeading />
                  <i />
                  <IconLink />
                  <IconList />
                  <IconPhoto />
                  <IconCode />
                </div>
                <div className="preview-writing">
                  <div className="preview-article-label">
                    <span>{post.category}</span>
                    <span>{post.readingMinutes} MIN READ</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p className="preview-deck">{post.description}</p>
                  <div className="preview-tldr">
                    <span>THE SHORT VERSION</span>
                    <p>{post.tldr}</p>
                  </div>
                  <h3>{post.headings[0] ?? "Start with the useful part"}</h3>
                  <p>
                    Good writing begins with a clear idea. Give readers the
                    context they need, then make every paragraph earn its place.
                  </p>
                </div>
              </div>
              <aside className="preview-inspector">
                <div className="preview-inspector-title">
                  Publishing details
                </div>
                <div className="preview-property">
                  <span>Format</span>
                  <strong>Markdown</strong>
                </div>
                <div className="preview-property">
                  <span>Category</span>
                  <strong>{post.category}</strong>
                </div>
                <div className="preview-property">
                  <span>Reading time</span>
                  <strong>{post.readingMinutes} minutes</strong>
                </div>
                <div className="preview-checks">
                  <p>BUILT INTO YOUR WORKFLOW</p>
                  {[
                    "Search preview",
                    "Content checks",
                    "Internal link suggestions",
                    "Live article preview",
                  ].map((label) => (
                    <div key={label}>
                      <IconCheck className="size-3.5" />
                      {label}
                    </div>
                  ))}
                </div>
                <div className="preview-tip">
                  <IconGitBranch className="size-4" />
                  <p>
                    Plain files.
                    <br />A familiar Git workflow.
                  </p>
                </div>
              </aside>
            </div>
          </TabsContent>
          <TabsContent value="read" className="preview-panel">
            <div className="reading-illustration">
              <div className="reading-illustration-header">
                <span>The journal.</span>
                <span>Thoughts, with a little more room.</span>
              </div>
              <div className="reading-illustration-body">
                <div className="reading-main">
                  <p className="eyebrow">
                    {post.category} <span aria-hidden> / </span>{" "}
                    {post.readingMinutes} MIN READ
                  </p>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                  <div className="preview-tldr">
                    <span>THE SHORT VERSION</span>
                    <p>{post.tldr}</p>
                  </div>
                  <Link href={`/blog/post/${post.slug}`} className="text-link">
                    Read the actual article
                    <IconArrowUpRight className="size-4" />
                  </Link>
                </div>
                <aside>
                  <span>IN THIS ARTICLE</span>
                  {post.headings.map((heading, index) => (
                    <p key={heading}>
                      <small>0{index + 1}</small>
                      {heading}
                    </p>
                  ))}
                </aside>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="publish" className="preview-panel">
            <div className="publishing-illustration">
              <div className="publishing-source">
                <IconFileText className="size-7" aria-hidden />
                <span>YOUR SOURCE</span>
                <h2>
                  One post.
                  <br />
                  Ready for the web.
                </h2>
                <code>content/posts/{post.slug}.md</code>
                <p>
                  Your build turns Markdown into a complete publication. No
                  content API keys. No database to provision.
                </p>
                <Link href="/docs#ship" className="text-link">
                  See the deployment guide
                  <IconArrowUpRight className="size-4" />
                </Link>
              </div>
              <div className="publishing-outputs">
                {[
                  {
                    title: "A complete article",
                    body: "Readable HTML, metadata, and social cards.",
                    href: `/blog/post/${post.slug}`,
                    icon: IconLayout,
                  },
                  {
                    title: "Findable by readers",
                    body: "A content-derived search index and archives.",
                    href: "/search-index.json",
                    icon: IconSearch,
                  },
                  {
                    title: "Ready for subscribers",
                    body: "Full-content RSS, generated from the same file.",
                    href: "/rss.xml",
                    icon: IconGitBranch,
                  },
                  {
                    title: "Readable by machines",
                    body: "An llms.txt index and raw Markdown routes.",
                    href: "/llms.txt",
                    icon: IconCode,
                  },
                ].map(({ title, body, href, icon: Icon }) => (
                  <a key={title} href={href}>
                    <Icon className="size-5" />
                    <div>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </div>
                    <IconArrowUpRight className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </figure>
  );
}
