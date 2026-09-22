"use client";
import {createElement as h, Suspense} from 'react';
import {usePathname,useSearchParams} from 'next/navigation.js';
import {StudioProvider} from './studio-runtime.js';
import {StudioShell} from './oss/components/dashboard/studio-shell.js';
import {DashboardClient} from './oss/components/dashboard/dashboard-client.js';
import {SettingsClient} from './oss/components/dashboard/settings-client.js';
import {FontPickerClient} from './oss/components/dashboard/font-picker-client.js';
import {PreviewThemesClient} from './oss/components/dashboard/preview-themes-client.js';
import {PostEditor} from './oss/components/editor/post-editor.js';
import {PreviewClient} from './oss/components/editor/preview-client.js';
import {runSeoChecks,seoScore} from './oss/lib/editor/seo-checks.js';
import {DEFAULT_SETTINGS} from './oss/lib/settings-shared.js';

function Screens(props){
 const pathname=usePathname(),query=useSearchParams();
 const settings={...DEFAULT_SETTINGS,...props.initialDashboardSettings,publicationName:props.initialSettings.name,publicationDescription:props.initialSettings.description,defaultAuthor:props.initialSettings.author,websiteUrl:props.initialSettings.siteUrl};
 const posts=props.initial.map(({post:p})=>({...p,updatedAt:p.updatedAt||'',canonical:p.canonical||'',coverTone:p.coverTone||'primary',coverImage:p.coverImage||'',coverAlt:p.coverAlt||'',ogImage:p.ogImage||'',keyphrase:p.keyphrase||'',faqs:p.faqs.map(f=>({q:f.question,a:f.answer}))}));
 const rows=posts.map(p=>({...p,authorName:p.author,status:p.draft?'draft':Date.parse(p.publishedAt)>props.initialNow?'scheduled':'published',words:p.body.split(/\s+/).filter(Boolean).length,seoScore:seoScore(runSeoChecks(p))}));
 const path=pathname.replace(/\/$/,'');
 let page;
 if(path.endsWith('/editor/preview')) page=h(PreviewClient);
 else if(path.endsWith('/editor')) page=h(PostEditor,{key:query.get('slug')||query.get('new')||'default',posts,authorSlugs:[...new Set([props.initialSettings.author||props.initialSettings.name,...posts.map(p=>p.author)])],canSave:true,initialSlug:query.get('new')==='1'?'__new__':query.get('slug')||undefined});
 else if(path.endsWith('/settings')) page=h(SettingsClient,{initial:settings,canSave:true});
 else if(path.endsWith('/fonts')) page=h(FontPickerClient,{initial:settings,canSave:true,sample:posts[0]||{title:props.initialSettings.name,description:'',category:'',body:'Preview your publication typography.'}});
 else if(path.endsWith('/preview')) page=h(PreviewThemesClient,{initial:settings,posts:posts.filter(p=>!p.draft&&Date.parse(p.publishedAt)<=props.initialNow),canSave:true});
 else page=h(DashboardClient,{rows,readOnly:false,view:path.endsWith('/board')?'board':'list',today:new Date(props.initialNow).toISOString().slice(0,10),seoThresholds:settings.seoScoreThresholds,initialReviews:props.initialReviews||{}});
 return h(StudioShell,{readOnly:false,publicationName:props.initialSettings.name},page);
}
export function OssStudio(props){return h(StudioProvider,{...props,name:props.initialSettings.name,siteUrl:props.initialSettings.siteUrl,settingsRevision:props.initialSettingsRevision},h(Suspense,{fallback:null},h(Screens,props)));}
