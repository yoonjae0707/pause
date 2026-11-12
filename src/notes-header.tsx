import React,{useEffect,useState} from 'react';

/** Key by video ID so a failed thumbnail never hides the next video's image. */
export function NotesHeader({videoId,onClose,title='PAUSE Notes',eyebrow}:{videoId:string;onClose?:()=>void;title?:string;eyebrow?:string}){
 const [failed,setFailed]=useState(false);
 return <header className="notes-header">
  {!failed&&<img className="notes-thumbnail" src={`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`} alt="" referrerPolicy="no-referrer" decoding="async" onError={()=>setFailed(true)}/>}
  <div className="notes-thumbnail-fade" aria-hidden="true"/>
  {onClose&&<button type="button" className="notes-close" aria-label="메모 패널 닫기" title="메모 패널 닫기" onClick={onClose}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button>}
  {eyebrow&&<p className="notes-eyebrow">{eyebrow}</p>}
  <h2 title={eyebrow?title:undefined}>{title}</h2>
 </header>;
}

/** Display-only title of the current watch page; re-read on SPA navigation and <title> changes. */
const readWatchTitle=()=>{const doc=document.title.replace(/^\(\d+\+?\)\s*/,'').replace(/ - YouTube$/,'').trim();return doc&&doc!=='YouTube'?doc:document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim()||'';};
export function useWatchTitle(id:string|undefined){
 const [title,setTitle]=useState(readWatchTitle);
 useEffect(()=>{const update=()=>setTitle(readWatchTitle());update();const head=document.querySelector('title');const observer=new MutationObserver(update);if(head)observer.observe(head,{childList:true,characterData:true,subtree:true});document.addEventListener('yt-navigate-finish',update);return()=>{observer.disconnect();document.removeEventListener('yt-navigate-finish',update);};},[id]);
 return title;
}
