import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {cascadeTargets,playCascade,snapshot,type CascadeSnapshot} from './list-cascade';

/** One presence lifecycle for sidebar, floating/fullscreen Notes and reflection. */
export function NotesReveal({open,children,mode='sidebar',onExited}:{open:boolean;children:React.ReactNode;mode?:'sidebar'|'floating'|'reflection';onExited?:()=>void}){
 const [mounted,setMounted]=useState(open);const ref=useRef<HTMLDivElement>(null);const exit=useRef(onExited);exit.current=onExited;
 const stopCascade=useRef<()=>void>(()=>{});
 useEffect(()=>()=>stopCascade.current(),[]);
 useLayoutEffect(()=>{
  if(open&&!mounted){setMounted(true);return;}
  const node=ref.current;if(!node||!mounted)return;
  let cancelled=false,done=false;
  const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=reduced?120:mode==='sidebar'?(open?500:380):(open?300:220);
  // Recommendation cascade: measure the visual "first" positions before the previous cascade is cancelled.
  const first:CascadeSnapshot|null=mode==='sidebar'&&!reduced&&typeof node.animate==='function'?(t=>t.length?snapshot(t):null)(cascadeTargets(node)):null;
  stopCascade.current();stopCascade.current=()=>{};
  const opacity=Number(getComputedStyle(node).opacity)||0;
  const startHeight=node.getBoundingClientRect().height;
  const endHeight=open?(node.firstElementChild as HTMLElement|null)?.scrollHeight??0:0;
  const finish=()=>{if(cancelled||done)return;done=true;node.style.opacity=open?'1':'0';if(mode==='sidebar'){node.style.height=open?'auto':'0px';node.style.overflow='';}animation?.cancel();if(!open){setMounted(false);exit.current?.();}};
  let animation:Animation|undefined;
  if(first){
   // Layout jumps to its final state at once; the cards are FLIP-inverted and wave into place.
   // While closing, the card keeps painting over the list (overflow visible, inert) as it fades out.
   node.style.height=open?'auto':'0px';node.style.overflow=open?'':'visible';
   animation=node.animate([{opacity},{opacity:open?1:0}],{duration,easing:open?'cubic-bezier(.2,0,0,1)':'cubic-bezier(.3,0,.8,.15)',fill:'both'});animation.finished.then(finish,()=>{});
   stopCascade.current=playCascade(first,open?'top-first':'bottom-first');
  }else if(duration&&typeof node.animate==='function'){
   if(mode==='sidebar'&&reduced&&open)node.style.height='auto';
   const overshoot=Math.min(10,endHeight*.025);
   const frames=mode==='sidebar'&&!reduced?(open?[
    {opacity,height:startHeight+'px',offset:0},
    {opacity:1,height:(endHeight+overshoot)+'px',offset:.72},
    {opacity:1,height:Math.max(0,endHeight-2)+'px',offset:.9},
    {opacity:1,height:endHeight+'px',offset:1},
   ]:[
    {opacity,height:startHeight+'px',offset:0},
    {opacity:opacity*.9,height:(startHeight+Math.min(4,startHeight*.01))+'px',offset:.08},
    {opacity:0,height:'0px',offset:.84},
    {opacity:0,height:'2px',offset:.94},
    {opacity:0,height:'0px',offset:1},
   ]):[{opacity},{opacity:open?1:0}];
   animation=node.animate(frames,{duration,easing:'cubic-bezier(.2,0,0,1)',fill:'both'});animation.finished.then(finish,()=>{});
  }else{node.style.opacity=open?'1':'0';if(mode==='sidebar')node.style.height=open?'auto':'0px';}
  const timer=setTimeout(finish,duration+32);
  return()=>{cancelled=true;clearTimeout(timer);if(animation&&!done){const value=getComputedStyle(node).opacity;const height=node.getBoundingClientRect().height;animation.cancel();node.style.opacity=value;if(mode==='sidebar'){node.style.height=height+'px';node.style.overflow='';}}};
 },[open,mounted,mode]);
 return <div ref={ref} className={`notes-reveal presence-${mode}`} data-open={open&&mounted?'true':undefined} aria-hidden={!open} inert={!open}><div className="notes-reveal-clip">{mounted&&children}</div></div>;
}
