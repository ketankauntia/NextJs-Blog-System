"use client";
import { createContext, useContext, useRef, type ReactNode } from 'react';
type Runtime = {studioHref:string;blogHref:string;homeHref:string;name:string;siteUrl:string;basePath:string;href:(path:string)=>string;request:(url:string,init?:RequestInit)=>Promise<Response>};
const Context = createContext<Runtime | null>(null);
export function useStudioRuntime() { const runtime=useContext(Context); if(!runtime) throw new Error('Missing Studio provider'); return runtime; }
export function StudioProvider({children,endpoint,token,studioHref,blogHref,homeHref,name,siteUrl='',basePath='',initial,settingsRevision,reviewsRevision=null}:{children:ReactNode;endpoint:string;token:string;studioHref:string;blogHref:string;homeHref:string;name:string;siteUrl?:string;basePath?:string;initial:{post:{slug:string};revision:string}[];settingsRevision:string|null;reviewsRevision?:string|null}) {
 const revisions=useRef(new Map(initial.map(r=>[r.post.slug,r.revision])));
 const settingsVersion=useRef(settingsRevision);
 const reviewsVersion=useRef(reviewsRevision);
 const href=(value:string)=>value==='/'?homeHref:value.replace(/^\/dashboard(?=\/|\?|$)/,studioHref).replace(/^\/blog(?=\/|\?|$)/,blogHref);
 async function request(url:string,init?:RequestInit) {
  if(url==='/api/editor/upload'&&init?.body instanceof FormData) {
   const file=init.body.get('file');
   if(!(file instanceof File)||file.size>8*1024*1024) return Response.json({error:'Choose an image up to 8 MB.'},{status:400});
   const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});
   return window.fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json','x-blog-studio-token':token,'x-blog-upload':'1'},body:JSON.stringify({action:'upload',data})});
  }
  const payload=JSON.parse(String(init?.body || '{}'));
  let body:object;
  if(url==='/api/editor/settings') body={action:'dashboard-settings',settings:payload,revision:settingsVersion.current};
  else if(url.startsWith('/api/editor/posts/')) {const slug=decodeURIComponent(url.slice('/api/editor/posts/'.length));body={action:'dashboard-post',slug,...payload,revision:revisions.current.get(slug)??null};}
  else if(url.startsWith('/api/editor/reviews/')) body={action:'review',slug:decodeURIComponent(url.slice('/api/editor/reviews/'.length)),...payload,revision:reviewsVersion.current};
  else return Response.json({error:'This operation is unavailable.'},{status:400});
  const response=await window.fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json','x-blog-studio-token':token},body:JSON.stringify(body)});
  if(response.ok) {const data=await response.clone().json();if(url==='/api/editor/settings') settingsVersion.current=data.revision; else if(url.startsWith('/api/editor/reviews/')) reviewsVersion.current=data.revision; else if(url.startsWith('/api/editor/posts/')) revisions.current.set(decodeURIComponent(url.slice('/api/editor/posts/'.length)),data.revision);}
  return response;
 }
 return <Context.Provider value={{studioHref,blogHref,homeHref,name,siteUrl,basePath,href,request}}>{children}</Context.Provider>;
}
