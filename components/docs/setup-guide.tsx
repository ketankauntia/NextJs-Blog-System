"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowDown, IconArrowRight, IconBrandGithub, IconCloud, IconDatabase, IconDeviceLaptop, IconLock, IconServer } from "@tabler/icons-react";
import { AgentSetupActions } from "@/components/docs/agent-setup-actions";
import { createPublishingSetup, defaultPublishingSetup, serializePublishingSetup, type ContentDestination, type PublishingMode, type HostingTarget, type PublishingSetup } from "@/lib/publishing/config";
import { ProviderOption } from "@/components/publishing/provider-option";
import { getSetupGuide } from "@/lib/publishing/guide";
import { productConfig } from "@/lib/product";

const inputClass = "w-full rounded-lg border bg-background px-3.5 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SetupGuide() {
  const [mode, setMode] = useState<PublishingMode>("local");
  const [remoteDestination, setRemoteDestination] = useState<ContentDestination>("github");
  const [hosting, setHosting] = useState<HostingTarget>("vercel");
  const [name, setName] = useState(defaultPublishingSetup.projectName);
  const [contentPath, setContentPath] = useState("content");
  const [loginRoute, setLoginRoute] = useState("/login");
  const [useR2, setUseR2] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const local = mode === "local";
  const destination = local ? "github" : remoteDestination;
  const assets = local ? "repository" : useR2 ? "r2" : destination === "github" ? "repository" : "supabase";
  const selection = { projectName: name, mode, destination, hosting, contentPath, loginRoute, assets } as const;

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
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="space-y-8 p-6 sm:p-8">
          <div className="sm:max-w-sm">
            <label htmlFor="project-name" className="mb-2 block text-sm font-semibold">Project name</label>
            <input id="project-name" name="projectName" value={name} required maxLength={80} onChange={event => { setName(event.target.value); clearFeedback(); }} className={inputClass} />
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">How would you like to write?</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <ProviderOption name="mode" value="local" label="Local" description="Write on your computer. Blog data stays in your repository." selected={local} icon={<IconDeviceLaptop className="size-5" />} onSelect={() => { setMode("local"); clearFeedback(); }} />
              <ProviderOption name="mode" value="self-hosted" label="Login-based" description="Self-hosted on your domain, with email and password." selected={!local} icon={<IconLock className="size-5" />} onSelect={() => { setMode("self-hosted"); clearFeedback(); }} />
              <ProviderOption name="mode" value="managed" label="Managed" description="A hosted service, managed for you." selected={false} disabled disabledReason="Coming soon" icon={<IconCloud className="size-5" />} onSelect={() => {}} />
            </div>
          </fieldset>

          {local ? (
            <div className="rounded-xl bg-muted/40 p-5">
              <p className="text-sm font-medium">Everything in your repository</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Posts and settings live in the folder you choose below. No login or database is needed. Commit and push using your existing Git workflow.</p>
            </div>
          ) : (
            <>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Login</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProviderOption name="authentication" value="email-password" label="Email and password" description="Individual accounts with Supabase Auth, whichever content store you choose." selected icon={<IconLock className="size-5" />} onSelect={() => {}} />
                  <ProviderOption name="authentication" value="oauth" label="OAuth" description="Sign in with Google, GitHub and more." selected={false} disabled disabledReason="Coming soon" icon={<IconBrandGithub className="size-5" />} onSelect={() => {}} />
                </div>
                <label htmlFor="login-route" className="mb-2 mt-5 block text-sm font-semibold">Login route</label>
                <input id="login-route" name="loginRoute" value={loginRoute} required maxLength={160} spellCheck={false} onChange={event => { setLoginRoute(event.target.value); clearFeedback(); }} aria-describedby="login-route-help" className={inputClass} placeholder="/login" />
                <p id="login-route-help" className="mt-2 break-all text-xs leading-relaxed text-muted-foreground">Your domain + {loginRoute || "/login"}. Use /login or an available path such as /team/sign-in. Your agent checks for route conflicts.</p>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">Where should your content live?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProviderOption name="destination" value="github" label="GitHub repository" description="Keep Markdown content in your own GitHub repository." selected={destination === "github"} icon={<IconBrandGithub className="size-5" />} onSelect={() => { setRemoteDestination("github"); clearFeedback(); }} />
                  <ProviderOption name="destination" value="supabase" label="Supabase Storage" description="Keep content and uploads in your own Supabase project." selected={destination === "supabase"} icon={<IconDatabase className="size-5" />} onSelect={() => { setRemoteDestination("supabase"); clearFeedback(); }} />
                </div>
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                  <input type="checkbox" name="r2" checked={useR2} onChange={event => { setUseR2(event.target.checked); clearFeedback(); }} className="mt-1 size-4 accent-primary" />
                  <span><span className="block text-sm font-medium">Use Cloudflare R2 for images and uploads</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Optional. Your written content stays in {destination === "github" ? "GitHub" : "Supabase Storage"}.</span></span>
                </label>
              </fieldset>
            </>
          )}

          <div>
            <label htmlFor="content-path" className="mb-2 block text-sm font-semibold">{destination === "supabase" ? "Content folder / storage prefix" : "Blog data folder in your repository"}</label>
            <input id="content-path" name="contentPath" value={contentPath} required maxLength={200} spellCheck={false} onChange={event => { setContentPath(event.target.value); clearFeedback(); }} aria-describedby="content-path-help" className={inputClass} placeholder="content" />
            <p id="content-path-help" className="mt-2 text-xs leading-relaxed text-muted-foreground">For example, content or data/blog. Posts use &lt;folder&gt;/posts and settings use &lt;folder&gt;/settings.json. Public images keep their existing URLs.</p>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Website hosting</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {productConfig.providers.hosting.map(option => <ProviderOption key={option.value} name="hosting" {...option} selected={hosting === option.value} icon={option.value === "vercel" ? <IconCloud className="size-5" /> : <IconServer className="size-5" />} onSelect={() => { setHosting(option.value); clearFeedback(); }} />)}
            </div>
          </fieldset>

        </div>
      </div>
      {validationError && <p role="alert" className="mt-4 text-sm text-destructive">{validationError}</p>}
      {setup && guide && <>
        <div className="mt-5 rounded-xl bg-muted/45 p-5" aria-live="polite">
          <p className="text-sm font-semibold">{guide.title}</p>
          <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{setup.contentPath}/posts · {local ? "No login" : `Login at ${setup.loginRoute}`} · {hosting === "vercel" ? "Vercel website" : "Your own server"}</p>
          {!local && <p className="mt-3 text-sm leading-6 text-muted-foreground">This path requires implementing and verifying authentication and storage adapters. The guide covers that work; selecting these options does not activate hosted editing.</p>}
        </div>

        <section id="agent-setup" className="mt-10 scroll-mt-24 rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8" aria-labelledby="agent-setup-title">
          <p className="font-mono text-xs tracking-[0.16em] text-primary">AUTOMATIC SETUP</p>
          <h2 id="agent-setup-title" className="mt-3 font-heading text-2xl font-semibold tracking-tight">Let your AI agent take it from here</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Copy the prompt into your agent in the target project. Its link opens the complete guide for your choices, including your folder, login route and hosting. The agent installs, checks its work, and asks when it needs access or a decision.</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{guide.accounts.length ? `Have ${guide.accounts.join(" and ")} ready. The agent asks you to sign in and confirm before accessing your accounts.` : "No provider sign-in is needed for local writing. The agent asks for access only if you want it to connect a repository or deploy."}</p>
          <div className="mt-5"><AgentSetupActions key={JSON.stringify(setup)} selection={setup} /></div>
        </section>

        <section id="manual-setup" className="mt-14 scroll-mt-24 border-t pt-10" aria-labelledby="manual-setup-title">
          <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground">MANUAL SETUP</p>
          <h2 id="manual-setup-title" className="mt-3 font-heading text-2xl font-semibold tracking-tight">Prefer to do it yourself?</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Follow this guide for {guide.title}. Changing your choices above updates these steps too.</p>
          <div className="mt-5">
            <button type="button" onClick={downloadSetup} className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"><IconArrowDown className="size-4" aria-hidden />Download publishing.json</button>
            <p role="status" className="mt-2 text-xs leading-6 text-muted-foreground">{notice}</p>
            <p role="alert" className="text-xs text-destructive">{error}</p>
          </div>
          <ol className="mt-8 space-y-9">
            {guide.steps.map((step, index) => <li key={step.id} className="border-t pt-6 first:border-0 first:pt-0">
              <p className="font-mono text-[0.68rem] tracking-[0.16em] text-primary">STEP {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{step.body}</p>
              {step.command && <pre className="mt-4 overflow-x-auto rounded-xl border bg-foreground p-5 text-xs leading-6 text-background"><code>{step.command}</code></pre>}
            </li>)}
          </ol>
          <Link href="/dashboard/editor" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">Explore the editor<IconArrowRight className="size-4" aria-hidden /></Link>
        </section>
      </>}
    </section>
  );
}
