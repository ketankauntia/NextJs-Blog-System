"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowDown, IconArrowRight, IconCloud, IconFolder, IconTransfer, IconArchive, IconDeviceLaptop, IconLock, IconServer, IconX } from "@tabler/icons-react";
import { SiGithub, SiSupabase, SiCloudflare, SiVercel } from "@icons-pack/react-simple-icons";
import { AgentSetupActions } from "@/components/docs/agent-setup-actions";
import { createPublishingSetup, serializePublishingSetup, type ContentDestination, type PublishingMode, type HostingTarget, type PublishingSetup, type ExistingContent } from "@/lib/publishing/config";
import { ProviderOption } from "@/components/publishing/provider-option";
import { getSetupGuide } from "@/lib/publishing/guide";


const inputClass = "w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SetupGuide() {
  const installation = "existing";
  const [showFreshNotice, setShowFreshNotice] = useState(false);
  const [mode, setMode] = useState<PublishingMode>("local");
  const [remoteDestination, setRemoteDestination] = useState<ContentDestination>("github");
  const [hosting, setHosting] = useState<HostingTarget>("existing");
  const [contentPath, setContentPath] = useState("content");
  const [blogRoute, setBlogRoute] = useState("/blog");
  const [existingContent, setExistingContent] = useState<ExistingContent>("keep");
  const [loginRoute, setLoginRoute] = useState("/login");
  const [useR2, setUseR2] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const local = mode === "local";
  const destination = local ? "github" : remoteDestination;
  const assets = local ? "repository" : destination === "r2" || useR2 ? "r2" : "repository";
  const existing = installation === "existing";
  const selection = { installation, projectName: null, mode, destination, hosting, contentPath, blogRoute, existingContent, loginRoute, assets } as const;

  function clearFeedback() { setNotice(""); setError(""); }

  function downloadSetup() {
    clearFeedback();
    try {
      const setup = createPublishingSetup(selection);
      const url = URL.createObjectURL(new Blob([serializePublishingSetup(setup)], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "publishing.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(local ? "Download requested. Add publishing.json to your repository root and have your agent prepare the content folder." : "Download requested. Give publishing.json to your agent to configure login and the selected providers. No accounts have been connected yet.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the setup. Please try again.");
    }
  }

  let setup: PublishingSetup | null = null;
  let validationError = "";
  try { setup = createPublishingSetup(selection); }
  catch (cause) { validationError = cause instanceof Error ? cause.message : "Check your setup choices."; }
  const guide = setup ? getSetupGuide(setup) : null;
  return (
    <section id="get-started" className="scroll-mt-24" aria-labelledby="setup-title">
      <div id="configure" className="mb-7 scroll-mt-24">
        <p className="font-mono text-xs tracking-[0.16em] text-primary">YOUR SETUP</p>
        <h2 id="setup-title" className="mt-3 font-heading text-3xl font-semibold tracking-tight">Choose how your blog runs</h2>
        <p className="mt-3 leading-7 text-muted-foreground">Choose once. Your AI instructions and manual guide below update together.</p>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="space-y-6 p-5 sm:p-7">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Where are you adding your blog?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <ProviderOption name="installation" value="fresh" label="Fresh project" description="Create your Next.js app first." selected={false} disabled disabledReason="Unavailable" icon={<IconDeviceLaptop className="size-4" />} onSelect={() => {}} onDisabledSelect={() => setShowFreshNotice(true)} />
              <ProviderOption name="installation" value="existing" label="Existing website" description="Add a blog to your app. Keep its identity and setup." selected icon={<IconServer className="size-4" />} onSelect={() => {}} />
            </div>
          </fieldset>
          <p className="text-sm leading-7 text-muted-foreground">Your site keeps its name, branding and current setup.</p>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">How would you like to write?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              <ProviderOption name="mode" value="local" label="Local" description="Write locally. Keep data in Git." selected={local} icon={<IconDeviceLaptop className="size-4" />} onSelect={() => { setMode("local"); clearFeedback(); }} />
              <ProviderOption name="mode" value="self-hosted" label="Login-based" description="Write from your website." selected={!local} icon={<IconLock className="size-4" />} onSelect={() => { setMode("self-hosted"); clearFeedback(); }} />
              <ProviderOption name="mode" value="managed" label="Managed" description="We handle the hosting." selected={false} disabled disabledReason="Coming soon" icon={<IconCloud className="size-4" />} onSelect={() => {}} />
            </div>
          </fieldset>

          {!local && (
            <>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Login</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ProviderOption name="authentication" value="email-password" label="Email and password" description="Powered by Supabase Auth." selected icon={<IconLock className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="authentication" value="oauth" label="OAuth" description="Google, GitHub and more." selected={false} disabled disabledReason="Coming soon" icon={<SiGithub className="size-4" />} onSelect={() => {}} />
                </div>
                <label htmlFor="login-route" className="mb-2 mt-5 block text-sm font-semibold">Login route</label>
                <div className="flex min-w-0 items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="shrink-0 border-r px-3 text-xs text-muted-foreground">www.xyzdomain.com/</span>
                  <input id="login-route" name="loginRoute" value={loginRoute.replace(/^\//, "")} required maxLength={159} spellCheck={false} onChange={event => { setLoginRoute("/" + event.target.value.replace(/^\//, "")); clearFeedback(); }} aria-describedby="login-route-help" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none" placeholder="login" />
                </div>
                <p id="login-route-help" className="mt-2 text-xs text-muted-foreground">Your domain is detected during setup. Existing login routes are checked first.</p>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Where should your content live?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  <ProviderOption name="destination" value="github" label="GitHub" description="Content in your repository." selected={destination === "github"} icon={<SiGithub className="size-4" />} onSelect={() => { setRemoteDestination("github"); clearFeedback(); }} />
                  <ProviderOption name="destination" value="supabase" label="Supabase" description="Content in Supabase Storage." selected={false} disabled disabledReason="Coming soon" icon={<SiSupabase className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="destination" value="r2" label="Cloudflare R2" description="Content and uploads together." selected={destination === "r2"} icon={<SiCloudflare className="size-4" />} onSelect={() => { setRemoteDestination("r2"); clearFeedback(); }} />
                </div>
                {destination !== "r2" ? <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-xs text-muted-foreground">
                  <input type="checkbox" name="r2" checked={useR2} onChange={event => { setUseR2(event.target.checked); clearFeedback(); }} className="size-4 accent-primary" />
                  <SiCloudflare className="size-4 shrink-0" aria-hidden />
                  Use R2 for images and uploads
                </label> : <p className="mt-3 text-xs text-muted-foreground">Posts, settings, images and uploads all stay in R2.</p>}
              </fieldset>
            </>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="content-path" className="mb-2 block text-sm font-medium">Where is your blog data stored?</label>
              <input id="content-path" name="contentPath" value={contentPath} required maxLength={200} spellCheck={false} onChange={event => { setContentPath(event.target.value); clearFeedback(); }} aria-describedby="content-path-help" className={inputClass} placeholder="content" />
              <p id="content-path-help" className="mt-2 text-xs leading-5 text-muted-foreground">{destination === "r2" ? "Folder prefix in your R2 bucket." : "Folder inside your app, e.g. content or data/blog."} Not a public URL.</p>
            </div>
            <div>
              <label htmlFor="blog-route" className="mb-2 block text-sm font-medium">Where can readers find your blog?</label>
              <div className="flex min-w-0 items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="shrink-0 border-r px-2 text-[11px] text-muted-foreground">www.xyzdomain.com/</span>
                <input id="blog-route" name="blogRoute" value={blogRoute.replace(/^\//, "")} required maxLength={159} spellCheck={false} onChange={event => { setBlogRoute("/" + event.target.value.replace(/^\//, "")); clearFeedback(); }} aria-describedby="blog-route-help" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none" placeholder="blog" />
              </div>
              <p id="blog-route-help" className="mt-2 text-xs leading-5 text-muted-foreground">Your domain + the blog route. The agent checks availability.</p>
            </div>
          </div>

          {existing && <fieldset>
            <legend className="mb-3 text-sm font-medium">What happens to your existing blog content?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              <ProviderOption name="existingContent" value="keep" label="Keep as is" description="Leave current content untouched." selected={existingContent === "keep"} icon={<IconFolder className="size-4" />} onSelect={() => { setExistingContent("keep"); clearFeedback(); }} />
              <ProviderOption name="existingContent" value="migrate" label="Port into this blog" description="Import posts and preserve URLs." selected={existingContent === "migrate"} icon={<IconTransfer className="size-4" />} onSelect={() => { setExistingContent("migrate"); clearFeedback(); }} />
              <ProviderOption name="existingContent" value="replace" label="Start fresh" description="Back up, then remove old blog content." selected={existingContent === "replace"} icon={<IconArchive className="size-4" />} onSelect={() => { setExistingContent("replace"); clearFeedback(); }} />
            </div>
            {existingContent === "replace" && <p className="mt-2 text-xs text-muted-foreground">Your agent confirms the exact removal scope after preparing a backup. Other website content stays untouched.</p>}
          </fieldset>}

          <fieldset>
            <legend className="mb-3 text-sm font-medium">{existing ? "Where is your website hosted?" : "Where will you host your website?"}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              <ProviderOption name="hosting" value="vercel" label="Vercel" description={existing ? "Keep your Vercel deployment." : "Deploy with Vercel."} selected={hosting === "vercel"} icon={<SiVercel className="size-4" />} onSelect={() => { setHosting("vercel"); clearFeedback(); }} />
              <ProviderOption name="hosting" value="self-hosted" label="Self-hosted" description={existing ? "Keep your own server." : "Use your own Node.js server."} selected={hosting === "self-hosted"} icon={<IconServer className="size-4" />} onSelect={() => { setHosting("self-hosted"); clearFeedback(); }} />
              {existing && <ProviderOption name="hosting" value="existing" label="Other / not sure" description="Detect and keep current hosting." selected={hosting === "existing"} icon={<IconCloud className="size-4" />} onSelect={() => { setHosting("existing"); clearFeedback(); }} />}
            </div>
          </fieldset>

        </div>
        {validationError && <p role="alert" className="border-t px-5 py-4 text-sm text-destructive sm:px-7">{validationError}</p>}
        {setup && guide && <section id="agent-setup" className="scroll-mt-24 border-t bg-muted/20 p-5 sm:p-7" aria-labelledby="agent-setup-title">
          <p className="font-mono text-[10px] tracking-[0.16em] text-primary">AUTOMATIC SETUP</p>
          <h2 id="agent-setup-title" className="mt-2 font-heading text-xl font-semibold tracking-tight">Set up with your AI agent</h2>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-6 text-muted-foreground">
            <li>{guide.title} · {setup.blogRoute} · {setup.contentPath}/posts</li>
            <li>Copy the prompt into your agent inside the target project.</li>
            <li>{guide.accounts.length ? `Sign in to ${guide.accounts.join(" and ")}, then confirm access when asked.` : "No account needed for local writing."}</li>
            {!local && <li>Hosted login and storage still need implementation; the agent guide includes this work.</li>}
          </ul>
          <div className="mt-4"><AgentSetupActions key={JSON.stringify(setup)} selection={setup} /></div>
        </section>}
      </div>
      {setup && guide && <>
        <div className="my-9 flex items-center gap-4" aria-label="Or set up manually"><div className="h-px flex-1 bg-border" /><span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">OR</span><div className="h-px flex-1 bg-border" /></div>
        <section id="manual-setup" className="scroll-mt-24" aria-labelledby="manual-setup-title">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">MANUAL SETUP</p>
          <h2 id="manual-setup-title" className="mt-2 font-heading text-xl font-semibold tracking-tight">Set it up yourself</h2>
          <div className="mt-5">
            <button type="button" onClick={downloadSetup} className="inline-flex min-h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"><IconArrowDown className="size-4" aria-hidden />Download publishing.json</button>
            <p role="status" className="mt-2 text-xs leading-6 text-muted-foreground">{notice}</p>
            <p role="alert" className="text-xs text-destructive">{error}</p>
          </div>
          <ol className="mt-8 space-y-9">
            {guide.steps.map((step, index) => <li key={step.id} className="border-t pt-6 first:border-0 first:pt-0">
              <p className="font-mono text-[0.68rem] tracking-[0.16em] text-primary">STEP {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{step.body}</p>
              {step.command && <pre className="mt-4 overflow-x-auto rounded-md border bg-foreground p-5 text-xs leading-6 text-background"><code>{step.command}</code></pre>}
            </li>)}
          </ol>
          <Link href="/dashboard/editor" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">Explore the editor<IconArrowRight className="size-4" aria-hidden /></Link>
        </section>
      </>}
      {showFreshNotice && <div className="fixed bottom-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg">
        <div role="status" className="min-w-0 flex-1 text-sm leading-6">
          <p>The least you can do is create a Next.js app ;)</p>
          <code className="mt-2 block select-all break-words font-mono text-xs">npx create-next-app@latest</code>
          <p className="mt-2 text-xs text-muted-foreground">Then come back and add your blog.</p>
        </div>
        <button type="button" aria-label="Dismiss notification" onClick={() => setShowFreshNotice(false)} className="flex size-8 shrink-0 items-center justify-center rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><IconX className="size-4" aria-hidden /></button>
      </div>}
    </section>
  );
}
