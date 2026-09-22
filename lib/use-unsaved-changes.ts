"use client";
import {useEffect} from 'react';

/** Guard both browser exits and client-side links while a form has unsaved work. */
export function useUnsavedChanges(dirty:boolean) {
  useEffect(()=>{
    if(!dirty) return;
    let leaving=false;
    const unload=(event:BeforeUnloadEvent)=>{if(!leaving){event.preventDefault();event.returnValue='';}};
    const click=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return;
      const anchor=(event.target as Element|null)?.closest?.('a');
      if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download')||!anchor.href||anchor.getAttribute('href')?.startsWith('#')) return;
      if(anchor.href===window.location.href) return;
      if(!window.confirm('You have unsaved changes. Leave this page?')) {event.preventDefault();event.stopPropagation();}
      else leaving=true;
    };
    window.addEventListener('beforeunload',unload);
    document.addEventListener('click',click,true);
    return ()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);};
  },[dirty]);
}
