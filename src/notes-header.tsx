import React,{useState} from 'react';

/** Key by video ID so a failed thumbnail never hides the next video's image. */
export function NotesHeader({videoId,onClose,title='PAUSE Notes'}:{videoId:string;onClose?:()=>void;title?:string}){
 const [failed,setFailed]=useState(false);
 return <header className="notes-header">
  {!failed&&<img className="notes-thumbnail" src={`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`} alt="" referrerPolicy="no-referrer" decoding="async" onError={()=>setFailed(true)}/>}
  <div className="notes-thumbnail-fade" aria-hidden="true"/>
  {onClose&&<button type="button" className="notes-close" aria-label="메모 패널 닫기" title="메모 패널 닫기" onClick={onClose}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button>}
  <h2>{title}</h2>
 </header>;
}
