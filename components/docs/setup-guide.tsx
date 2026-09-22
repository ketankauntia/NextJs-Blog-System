"use client";

import { useState } from "react";
import { LicenseNotice } from "@/components/license-notice";
import Link from "next/link";
import { IconArrowRight, IconCloud, IconDatabase, IconDeviceLaptop, IconLock, IconServer, IconX } from "@tabler/icons-react";
import { SiGithub, SiSupabase, SiCloudflare, SiVercel } from "@icons-pack/react-simple-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/blog-ui/select";
import { SetupCodeBlock } from "@/components/docs/setup-code-block";
import { AgentSetupActions } from "@/components/docs/agent-setup-actions";
import { createPublishingSetup, type ContentDestination, type PublishingMode, type HostingTarget, type PublishingSetup, type ExistingContent } from "@/lib/publishing/config";
import { ProviderOption } from "@/components/publishing/provider-option";
import { getSetupGuide } from "@/lib/publishing/guide";



export function SetupGuide() {
  const installation = "existing";
  const [showFreshNotice, setShowFreshNotice] = useState(false);
  const [mode, setMode] = useState<PublishingMode>("local");
  const [remoteDestination] = useState<ContentDestination>("r2");
  const [hosting, setHosting] = useState<HostingTarget>("existing");
  const [contentRoot, setContentRoot] = useState("app");
  const [contentFolder, setContentFolder] = useState("");
  const contentPath = `${contentRoot}/${contentFolder || "blog"}`;
  const [blogRoute, setBlogRoute] = useState("/blog");
  const [existingContent, setExistingContent] = useState<ExistingContent>("keep");
  const [loginRoute, setLoginRoute] = useState("/login");

  const local = mode === "local";
  const destination = local ? "github" : remoteDestination;
  const selectedHosting = local ? hosting : "cloudflare";
  const assets = local ? "repository" : "r2";
  const existing = installation === "existing";
  const selection = { installation, projectName: null, mode, destination, hosting: selectedHosting, contentPath, blogRoute, existingContent, loginRoute, assets } as const;

  let setup: PublishingSetup | null = null;
  let validationError = "";
  try { setup = createPublishingSetup(selection); }
  catch (cause) { validationError = cause instanceof Error ? cause.message : "Check your setup choices."; }
  const guide = setup ? getSetupGuide(setup) : null;
  return (
    <section id="get-started" className="scroll-mt-24" aria-labelledby="setup-title">
      <LicenseNotice />
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
              <ProviderOption name="mode" value="local" label="Local" description="Write locally. Keep data in Git." selected={local} icon={<IconDeviceLaptop className="size-4" />} onSelect={() => { setMode("local"); }} />
              <ProviderOption name="mode" value="self-hosted" label="Login-based" description="Write from your website." selected={!local} icon={<IconLock className="size-4" />} onSelect={() => { setMode("self-hosted"); }} />
              <ProviderOption name="mode" value="managed" label="Managed" description="We handle the hosting." selected={false} disabled disabledReason="Coming soon" icon={<IconCloud className="size-4" />} onSelect={() => {}} />
            </div>
          </fieldset>

          {!local && (
            <>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Infrastructure stack</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  <ProviderOption name="stack" value="cloudflare" label="Cloudflare" description="Workers, D1 and R2 together." selected icon={<SiCloudflare className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="stack" value="existing" label="Existing stack" description="Choose each provider yourself." selected={false} disabled disabledReason="Coming soon" icon={<IconServer className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="stack" value="aws" label="AWS" description="AWS-native hosting and storage." selected={false} disabled disabledReason="Coming soon" icon={<IconCloud className="size-4" />} onSelect={() => {}} />
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Login</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ProviderOption name="authentication" value="email-password" label="Email and password" description="Accounts and sessions in Cloudflare D1." selected icon={<IconLock className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="authentication" value="oauth" label="OAuth" description="Google, GitHub and more." selected={false} disabled disabledReason="Coming soon" icon={<SiGithub className="size-4" />} onSelect={() => {}} />
                </div>
                <label htmlFor="login-route" className="mb-2 mt-5 block text-sm font-semibold">Login route</label>
                <div className="flex min-w-0 items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                  <span className="shrink-0 border-r px-3 text-xs text-muted-foreground">www.xyzdomain.com/</span>
                  <input id="login-route" name="loginRoute" value={loginRoute.replace(/^\//, "")} required maxLength={159} spellCheck={false} onChange={event => { setLoginRoute("/" + event.target.value.replace(/^\//, "")); }} aria-describedby="login-route-help" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none" placeholder="login" />
                </div>
                <p id="login-route-help" className="mt-2 text-xs text-muted-foreground">Your domain is detected during setup. Existing login routes are checked first.</p>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Where should your content live?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  <ProviderOption name="destination" value="r2" label="Cloudflare R2" description="Posts, settings and uploads." selected={destination === "r2"} icon={<SiCloudflare className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="destination" value="github" label="GitHub" description="Content in your repository." selected={false} disabled disabledReason="Coming soon" icon={<SiGithub className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="destination" value="supabase" label="Supabase" description="Content in Supabase Storage." selected={false} disabled disabledReason="Coming soon" icon={<SiSupabase className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="destination" value="neon" label="Neon" description="Postgres-backed content storage." selected={false} disabled disabledReason="Coming soon" icon={<IconDatabase className="size-4" />} onSelect={() => {}} />
                  <ProviderOption name="destination" value="aws-s3" label="Amazon S3" description="AWS object storage." selected={false} disabled disabledReason="Coming soon" icon={<IconCloud className="size-4" />} onSelect={() => {}} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">The bucket stays private. Public articles and approved assets are served through authenticated application routes.</p>
              </fieldset>
            </>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="content-path" className="mb-2 block text-sm font-medium">Where is your blog data stored?</label>
              <div className="flex min-w-0 rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                <Select value={contentRoot} onValueChange={setContentRoot}>
                  <SelectTrigger aria-label="Blog data parent folder" className="w-28 shrink-0 self-stretch rounded-none rounded-l-md border-0 border-r px-3 data-[size=default]:h-auto dark:bg-transparent"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" align="start">
                    {['app', 'src/app', 'content', 'data'].map(folder => <SelectItem key={folder} value={folder}>{folder}/</SelectItem>)}
                  </SelectContent>
                </Select>
                <input id="content-path" name="contentFolder" value={contentFolder} maxLength={180} spellCheck={false} onChange={event => setContentFolder(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none" placeholder="blog" />
              </div>
            </div>
            <div>
              <label htmlFor="blog-route" className="mb-2 block text-sm font-medium">Where can readers find your blog?</label>
              <div className="flex min-w-0 items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="shrink-0 border-r px-2 text-[11px] text-muted-foreground">www.xyzdomain.com/</span>
                <input id="blog-route" name="blogRoute" value={blogRoute.replace(/^\//, "")} required maxLength={159} spellCheck={false} onChange={event => { setBlogRoute("/" + event.target.value.replace(/^\//, "")); }} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none" placeholder="blog" />
              </div>
            </div>
          </div>

          {existing && <fieldset>
            <legend className="mb-3 text-sm font-medium">What happens to your existing blog content?</legend>
            <div className="space-y-2">
              {([
                ["migrate", "Port my existing data", ["Import existing blog content into this system.", "Save anything that cannot be imported in a review folder, with details."]],
                ["replace", "Start fresh", ["Remove all existing blog data after a backup and scope review."]],
                ["keep", "Just integrate blogs", ["Keep my existing data untouched.", "I will port my old data myself."]],
              ] as const).map(([value, label, points]) => <label key={value} className="flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="existingContent" value={value} checked={existingContent === value} onChange={() => setExistingContent(value)} className="mt-1 size-4 shrink-0 accent-primary" />
                <div className="min-w-0"><span className="text-sm font-medium">{label}</span><ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">{points.map(point => <li key={point}>{point}</li>)}</ul></div>
              </label>)}
            </div>
          </fieldset>}

          <fieldset>
            <legend className="mb-3 text-sm font-medium">{existing ? "Where is your website hosted?" : "Where will you host your website?"}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {!local && <ProviderOption name="hosting" value="cloudflare" label="Cloudflare Workers" description="Required for the Cloudflare stack." selected icon={<SiCloudflare className="size-4" />} onSelect={() => {}} />}
              <ProviderOption name="hosting" value="vercel" label="Vercel" description={local ? (existing ? "Keep your Vercel deployment." : "Deploy with Vercel.") : "Custom-provider setup is not available yet."} selected={local && hosting === "vercel"} disabled={!local} disabledReason={!local ? "Coming soon" : undefined} icon={<SiVercel className="size-4" />} onSelect={() => { setHosting("vercel"); }} />
              <ProviderOption name="hosting" value="self-hosted" label="Self-hosted" description={local ? (existing ? "Keep your own server." : "Use your own Node.js server.") : "Custom-provider setup is not available yet."} selected={local && hosting === "self-hosted"} disabled={!local} disabledReason={!local ? "Coming soon" : undefined} icon={<IconServer className="size-4" />} onSelect={() => { setHosting("self-hosted"); }} />
              {existing && local && <ProviderOption name="hosting" value="existing" label="Other / not sure" description="Detect and keep current hosting." selected={hosting === "existing"} icon={<IconCloud className="size-4" />} onSelect={() => { setHosting("existing"); }} />}
            </div>
          </fieldset>

        </div>
        {validationError && <p role="alert" className="border-t px-5 py-4 text-sm text-destructive sm:px-7">{validationError}</p>}
        {setup && guide && <section id="agent-setup" className="scroll-mt-24 border-t bg-muted/20 p-5 sm:p-7" aria-labelledby="agent-setup-title">
          <p className="font-mono text-[10px] tracking-[0.16em] text-primary">AUTOMATIC SETUP</p>
          <h2 id="agent-setup-title" className="mt-2 font-heading text-xl font-semibold tracking-tight">Set up with your AI agent</h2>
          <div className="mt-5"><AgentSetupActions key={JSON.stringify(setup)} selection={setup} preview /></div>
        </section>}
      </div>
      {setup && guide && <>
        <div className="my-9 flex items-center gap-4" aria-label="Or set up manually"><div className="h-px flex-1 bg-border" /><span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">OR</span><div className="h-px flex-1 bg-border" /></div>
        <section id="manual-setup" className="scroll-mt-24" aria-labelledby="manual-setup-title">
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">MANUAL SETUP</p>
          <h2 id="manual-setup-title" className="mt-2 font-heading text-xl font-semibold tracking-tight">Set it up yourself</h2>
          <ol className="mt-8 space-y-9">
            {guide.steps.map((step, index) => <li key={step.id} className="border-t pt-6 first:border-0 first:pt-0">
              <p className="font-mono text-[0.68rem] tracking-[0.16em] text-primary">STEP {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-heading text-xl font-semibold">{step.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">{step.points.map(point => <li key={point}>{point}</li>)}</ul>
              {step.command && <SetupCodeBlock code={step.command} language={step.language ?? "bash"} filename={step.filename} />}
            </li>)}
          </ol>
          <div className="mt-8 flex justify-end"><Link href="/dashboard/editor" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-950 shadow-sm outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ring">Explore the editor<IconArrowRight className="size-4" aria-hidden /></Link></div>
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
