import React,{useEffect,useState} from 'react';

/** Keep content alive during collapse and cancel pending exits when reopened quickly. */
export function NotesReveal({open,children}:{open:boolean;children:React.ReactNode}){
 const [mounted,setMounted]=useState(open);const [expanded,setExpanded]=useState(false);
 useEffect(()=>{
  let first=0,second=0;let timer:ReturnType<typeof setTimeout>|undefined;
  if(open){setMounted(true);first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>setExpanded(true));});}
  else{setExpanded(false);timer=setTimeout(()=>setMounted(false),560);}
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);if(timer)clearTimeout(timer);};
 },[open]);
 return <div className="notes-reveal" data-open={expanded&&open?'true':undefined} aria-hidden={!open} inert={!open}><div className="notes-reveal-clip">{mounted&&children}</div></div>;
}
