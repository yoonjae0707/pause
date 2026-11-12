/**
 * ANIM-001: staggered FLIP cascade for the YouTube recommendation column.
 * Only Web Animations effects are applied to YouTube elements (no inline style writes),
 * so cancelling or finishing an animation always leaves the page exactly as YouTube rendered it.
 */
export const CASCADE={stagger:30,duration:450,bounce:4,maxSteps:15};
/** Recommendation entries; nested matches are collapsed to the outermost one. */
const ITEM='yt-lockup-view-model,ytd-compact-video-renderer,ytd-compact-radio-renderer,ytd-compact-playlist-renderer,ytd-compact-movie-renderer,ytd-ad-slot-renderer,ytd-reel-shelf-renderer,ytd-continuation-item-renderer,yt-related-chip-cloud-renderer,yt-chip-cloud-renderer';
export type CascadeSnapshot={el:HTMLElement;top:number}[];

/** Blocks that follow the docked Notes host in the recommendation column; empty means "use the height fallback". */
export function cascadeTargets(node:Element):HTMLElement[]{
 const root=node.getRootNode();const host=root instanceof ShadowRoot?root.host:null;const container=host?.parentElement;
 if(!host||!container||!container.querySelector(ITEM))return [];
 const out:HTMLElement[]=[];
 const walk=(el:Element)=>{if(!(el instanceof HTMLElement))return;if(el.matches(ITEM)){out.push(el);return;}if(el.querySelector(ITEM)){for(const child of Array.from(el.children))walk(child);return;}out.push(el);};
 for(const child of Array.from(container.children))if(child!==host)walk(child);
 return out;
}

/** "First" positions, measured visually (including any running cascade transform) before the layout change. */
export const snapshot=(targets:HTMLElement[]):CascadeSnapshot=>targets.map(el=>({el,top:el.getBoundingClientRect().top}));

/**
 * Plays the cascade after the layout has changed. Distances are the real before/after DOM coordinate
 * differences, so scroll anchoring, variable card heights and partial (interrupted) states are all respected.
 * Returns a stop function that cancels every effect; resize and SPA navigation stop it automatically.
 */
export function playCascade(first:CascadeSnapshot,order:'top-first'|'bottom-first'):()=>void{
 const view=innerHeight;const moves:{el:HTMLElement;dy:number;top:number}[]=[];
 for(const {el,top} of first){
  if(!el.isConnected)continue;const rect=el.getBoundingClientRect();const dy=top-rect.top;
  if(rect.height<=0||Math.abs(dy)<1)continue;
  if(Math.min(top,rect.top)>view||Math.max(top,rect.top)+rect.height<0)continue;// off-screen both before and after
  moves.push({el,dy,top:rect.top});
 }
 if(!moves.length)return ()=>{};
 moves.sort((a,b)=>a.top-b.top);if(order==='bottom-first')moves.reverse();
 const animations=moves.map(({el,dy},index)=>{
  const over=-Math.sign(dy)*Math.min(CASCADE.bounce,Math.abs(dy)*.1);// overshoot past the resting place in the direction of travel
  return el.animate([
   {transform:`translateY(${dy}px)`,easing:'cubic-bezier(.3,0,.25,1)'},
   {transform:`translateY(${over}px)`,offset:.62,easing:'cubic-bezier(.4,0,.4,1)'},
   {transform:`translateY(${-over*.25}px)`,offset:.84,easing:'ease-out'},
   {transform:'translateY(0px)'},
  ],{duration:CASCADE.duration,delay:Math.min(index,CASCADE.maxSteps)*CASCADE.stagger,fill:'backwards'});
 });
 let live=true;
 const stop=()=>{if(!live)return;live=false;clearTimeout(timer);for(const a of animations)a.cancel();removeEventListener('resize',stop);document.removeEventListener('yt-navigate-start',stop);};
 addEventListener('resize',stop);document.addEventListener('yt-navigate-start',stop);
 const timer=setTimeout(stop,CASCADE.duration+Math.min(moves.length-1,CASCADE.maxSteps)*CASCADE.stagger+100);
 return stop;
}
