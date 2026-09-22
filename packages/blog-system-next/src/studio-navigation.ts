"use client";
import {usePathname as useNextPathname,useRouter as useNextRouter} from 'next/navigation.js';
import {useStudioRuntime} from './studio-runtime.js';
export {useSearchParams} from 'next/navigation.js';
export function useRouter(){const router=useNextRouter(),runtime=useStudioRuntime();const href=(url:string)=>runtime.href(url).slice(runtime.basePath.length)||'/';return {...router,push:(url:string)=>router.push(href(url)),replace:(url:string)=>router.replace(href(url))};}
export function usePathname(){const runtime=useStudioRuntime();const path=useNextPathname();const mount=path.startsWith(runtime.studioHref)?runtime.studioHref:runtime.studioHref.slice(runtime.basePath.length);return path.startsWith(mount)?'/dashboard'+path.slice(mount.length):path;}
