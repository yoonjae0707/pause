import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {cascadeTargets,playCascade,snapshot,type CascadeSnapshot} from './list-cascade';
import {diagnostic} from './diagnostics';

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
  // Fullscreen Notes slide in from the right; the reflection card rises over a dimmed, blurred backdrop.
  const root=node.getRootNode();
  const slide=mode==='floating'&&!reduced&&typeof node.animate==='function'&&root instanceof ShadowRoot&&root.host.hasAttribute('data-fullscreen');
  const backdrop=mode==='reflection'?node.querySelector<HTMLElement>('.backdrop'):null;const dialog=backdrop?.querySelector<HTMLElement>('.dialog')??null;
  const rise=!!(backdrop&&dialog)&&typeof node.animate==='function';
  const duration=reduced?120:mode==='sidebar'?(open?500:380):slide?(open?380:280):rise?(open?420:280):(open?300:220);
  const tracked:{el:HTMLElement;a:Animation;props:string[]}[]=[];
  const track=(el:HTMLElement,a:Animation,props:string[])=>{tracked.push({el,a,props});return a;};
  // Recommendation cascade: measure the visual "first" positions before the previous cascade is cancelled.
  const targets=mode==='sidebar'&&!reduced&&typeof node.animate==='function'?cascadeTargets(node):[];
  const first:CascadeSnapshot|null=targets.length?snapshot(targets):null;
  stopCascade.current();stopCascade.current=()=>{};
  const opacity=Number(getComputedStyle(node).opacity)||0;
  const startHeight=node.getBoundingClientRect().height;
  const endHeight=open?(node.firstElementChild as HTMLElement|null)?.scrollHeight??0:0;
  const finish=()=>{if(cancelled||done)return;done=true;for(const {el,a,props} of tracked){a.cancel();if(open)for(const p of props)el.style.removeProperty(p);}if(slide||rise)node.style.removeProperty('transform');node.style.opacity=open?'1':'0';if(mode==='sidebar'){node.style.height=open?'auto':'0px';node.style.overflow='';}animation?.cancel();if(!open){setMounted(false);exit.current?.();}};
  let animation:Animation|undefined;
  if(first){
   // Layout jumps to its final state at once; the cards are FLIP-inverted and wave into place.
   // While closing, the card keeps painting over the list (overflow visible, inert) as it fades out.
   node.style.height=open?'auto':'0px';node.style.overflow=open?'':'visible';
   animation=node.animate([{opacity},{opacity:open?1:0}],{duration,easing:open?'cubic-bezier(.2,0,0,1)':'cubic-bezier(.3,0,.8,.15)',fill:'both'});animation.finished.then(finish,()=>{});
   // Opening waves top-down (each card slides under the next one, which paints above it); closing rises bottom-first.
   const wave=playCascade(first,open?'top-first':'bottom-first');stopCascade.current=wave.stop;
   diagnostic('list-cascade',{reason:`${open?'open':'close'} targets=${targets.length} moved=${wave.moved}`});
  }else if(rise){
   // Opacity stays on the parts, never on an ancestor: an ancestor with opacity < 1 would cut the backdrop blur off from the page.
   node.style.opacity='1';
   const fresh=open&&!dialog!.style.opacity;const cs=getComputedStyle(dialog!);const bs=getComputedStyle(backdrop!);
   const lift=reduced?'none':'translateY(36px)';
   const from={opacity:fresh?'0':cs.opacity||'1',transform:fresh?lift:cs.transform||'none'};
   const scrimFrom={backgroundColor:fresh?'rgba(0, 0, 0, 0)':bs.backgroundColor||'rgba(0, 0, 0, 0)',backdropFilter:fresh?'blur(0px)':bs.backdropFilter&&bs.backdropFilter!=='none'?bs.backdropFilter:'blur(0px)'};
   const scrimTo=open?{backgroundColor:'rgba(0, 0, 0, 0.32)',backdropFilter:'blur(12px)'}:{backgroundColor:'rgba(0, 0, 0, 0)',backdropFilter:'blur(0px)'};
   track(backdrop!,backdrop!.animate([scrimFrom,scrimTo],{duration:open?duration-60:duration,easing:'ease-out',fill:'both'}),['background-color','backdrop-filter']);
   animation=track(dialog!,dialog!.animate([from,open?{opacity:'1',transform:'none'}:{opacity:'0',transform:lift}],{duration,easing:open?'cubic-bezier(.2,.8,.2,1)':'cubic-bezier(.4,0,1,1)',fill:'both'}),['opacity','transform']);
   animation.finished.then(finish,()=>{});
  }else if(slide){
   const panel=node.querySelector<HTMLElement>('.panel');const away=`translateX(${(panel?.offsetWidth??0)+48}px)`;
   const start=open&&!node.style.transform?away:getComputedStyle(node).transform||'none';
   animation=track(node,node.animate([{opacity,transform:start},open?{opacity:1,transform:'none'}:{opacity:0,transform:away}],{duration,easing:open?'cubic-bezier(.2,.8,.2,1)':'cubic-bezier(.4,0,1,1)',fill:'both'}),['transform']);
   animation.finished.then(finish,()=>{});
  }else if(duration&&typeof node.animate==='function'){
   if(mode==='sidebar')diagnostic('list-cascade',{reason:`${open?'open':'close'} fallback=${reduced?'reduced-motion':'height'}`});
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
  return()=>{cancelled=true;clearTimeout(timer);if(!done)for(const {el,a,props} of tracked){if(el===node)continue;const cs=getComputedStyle(el);const values=props.map(p=>cs.getPropertyValue(p));a.cancel();props.forEach((p,i)=>el.style.setProperty(p,values[i]||''));}
   if(animation&&!done&&slide){const t=getComputedStyle(node).transform;const value=getComputedStyle(node).opacity;animation.cancel();node.style.opacity=value;node.style.transform=t&&t!=='none'?t:'';return;}
   if(animation&&!done&&!rise){const value=getComputedStyle(node).opacity;const height=node.getBoundingClientRect().height;animation.cancel();node.style.opacity=value;if(mode==='sidebar'){node.style.height=height+'px';node.style.overflow='';}}};
 },[open,mounted,mode]);
 return <div ref={ref} className={`notes-reveal presence-${mode}`} data-open={open&&mounted?'true':undefined} aria-hidden={!open} inert={!open}><div className="notes-reveal-clip">{mounted&&children}</div></div>;
}
