"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowDown, IconArrowRight, IconBrandGithub, IconCloud, IconDatabase, IconDeviceLaptop, IconLock, IconServer } from "@tabler/icons-react";
import { AgentSetupActions } from "@/components/docs/agent-setup-actions";
import { createPublishingSetup, defaultPublishingSetup, serializePublishingSetup, type ContentDestination, type PublishingMode, type HostingTarget } from "@/lib/publishing/config";
import { ProviderOption } from "@/components/publishing/provider-option";
import { productConfig } from "@/lib/product";

const inputClass = "w-full rounded-lg border bg-background px-3.5 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PublishingSetupPanel() {
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

  function downloadSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-9 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Open-source publishing setup</p>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Your blog. Your content.</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">Write locally in your repository, or set up a login on your own domain. Start with the essentials.</p>
      </div>

      <form onSubmit={downloadSetup} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
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

          <div aria-live="polite" aria-atomic="true" className="rounded-xl bg-muted/50 p-5">
            <p className="mb-4 text-sm font-semibold">Your setup</p>
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {[
                ["Writing", local ? "Local, in your repository" : "Login-based, on your domain"],
                ["Content", local ? `${contentPath || "content"}/posts` : destination === "github" ? "Your GitHub repository" : "Your Supabase Storage"],
                ["Login", local ? "Not required" : `Email and password at ${loginRoute || "/login"}`],
                ["Images and uploads", assets === "r2" ? "Your Cloudflare R2 bucket" : assets === "supabase" ? "Your Supabase Storage" : "Your repository"],
              ].map(([term, detail]) => <div key={term}><dt className="text-xs text-muted-foreground">{term}</dt><dd className="mt-1 break-words font-medium">{detail}</dd></div>)}
            </dl>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-sm font-semibold">Let your coding agent set it up</h2>
            <p className="mb-4 mt-2 text-sm leading-relaxed text-muted-foreground">Copy the setup link or full prompt. Your agent first asks you to sign in to the required provider accounts and confirm it can proceed, then handles the available setup steps. You never paste passwords or tokens here.</p>
            <AgentSetupActions key={JSON.stringify(selection)} compact selection={selection} />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">Local and login-based self-hosting are the open-source scope. Managed hosting, OAuth, audit logs and advanced team features are for later.</p>
        </div>
        <div className="border-t bg-muted/20 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-medium">{local ? "Local workflow available" : "Agent configuration required"}</p><p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">{local ? "Download your choices to configure this repository." : "This export describes your setup. Authentication and remote storage adapters still need implementation and verification before hosted editing works."}</p></div>
            <button type="submit" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"><IconArrowDown className="size-4" aria-hidden />Download setup</button>
          </div>
          <p id="setup-error" role="alert" className="mt-3 text-sm text-destructive">{error}</p>
          <p role="status" className="text-sm text-muted-foreground">{notice}</p>
        </div>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>One project. Your infrastructure.</span>
        <Link href="/dashboard/editor" className="inline-flex min-h-11 items-center gap-2 rounded text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">Open the editor<IconArrowRight className="size-4" aria-hidden /></Link>
      </div>
    </main>
  );
}
