import {materialActionCSS} from './material-theme';
const selectors=[
 'ytd-watch-metadata #actions #top-level-buttons-computed',
 'ytd-watch-metadata #actions-inner #top-level-buttons-computed',
 'ytd-watch-flexy #above-the-fold #actions ytd-menu-renderer #top-level-buttons-computed',
];
const css=`:host{display:inline-flex;flex:0 0 auto;align-self:center;align-items:center;margin-inline-start:8px;vertical-align:middle}button{box-sizing:border-box;appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;border:0;margin:0;border-radius:999px;padding:0 12px;height:var(--action-height,36px);font-family:var(--action-font,Roboto,Arial,sans-serif);font-size:var(--action-font-size,14px);font-weight:var(--action-font-weight,500);line-height:normal;letter-spacing:var(--action-spacing,normal);cursor:pointer}svg{display:block;width:24px;height:24px;flex:none}button:focus-visible{outline:2px solid #0b57d0;outline-offset:2px}button:disabled{opacity:.45;cursor:default}@media(forced-colors:active){button{border:1px solid ButtonText;color:ButtonText;background:ButtonFace}}`;
/** A bounded selector set, one coalesced refresh per frame, no polling or document-wide queries. */
export class ActionEntry {
 private host=document.createElement('span');private button:HTMLButtonElement;private observer:MutationObserver;private resize:ResizeObserver|undefined;private frame:number|undefined;private disposed=false;private placed=false;
 constructor(private toggle:()=>void,private placement:(placed:boolean)=>void){
  this.host.dataset.pauseAction='true';const root=this.host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=css+materialActionCSS;root.append(style);
  this.button=document.createElement('button');this.button.type='button';this.button.setAttribute('aria-label','PAUSE Note — 영상 메모');this.button.setAttribute('aria-expanded','false');this.button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z M14 3v6h6 M9 12v5 M14 12v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>PAUSE Note</span>';this.button.title='PAUSE 확장 프로그램 · 영상 메모';root.append(this.button);this.button.addEventListener('click',this.click);
  this.observer=new MutationObserver(records=>{if(records.some(record=>{
   if(record.target===this.host)return false;
   if(record.type==='attributes')return record.target===document.documentElement||(record.target instanceof Element&&(!!record.target.closest('ytd-watch-metadata')||record.target.matches('ytd-watch-flexy,#above-the-fold')));
   const relevant='ytd-watch-metadata,ytd-watch-flexy,ytd-page-manager,#above-the-fold,#actions,#actions-inner,#top-level-buttons-computed';
   return record.target instanceof Element&&!!record.target.closest('ytd-watch-metadata')||[...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&(node.matches(relevant)||!!node.querySelector(relevant)));
  }))this.schedule();});this.observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['dark','hidden','class','style']});
  if(typeof ResizeObserver!=='undefined'){this.resize=new ResizeObserver(this.schedule);}
  window.addEventListener('resize',this.schedule);window.addEventListener('popstate',this.schedule);document.addEventListener('yt-navigate-finish',this.schedule);this.schedule();
 }
 private click=(event:MouseEvent)=>{event.stopPropagation();this.toggle();};
 setExpanded(value:boolean){this.button.setAttribute('aria-expanded',String(value));}
 private schedule=()=>{if(this.disposed||this.frame!==undefined)return;this.frame=requestAnimationFrame(()=>{this.frame=undefined;this.refresh();});};
 refresh(){try{this.place();}catch{this.host.remove();if(this.placed){this.placed=false;this.placement(false);}}}
 private matchNeighbor(target:HTMLElement){
  this.host.style.marginInlineStart=parseFloat(getComputedStyle(target).columnGap)>0?'0':'8px';
  // Read only a bounded set of native action buttons; never clone YouTube behavior/classes.
  const reference=Array.from(target.querySelectorAll<HTMLButtonElement>('button')).slice(0,12).find(button=>{
   const height=button.getBoundingClientRect().height;return height>=24&&height<=80&&!button.disabled&&getComputedStyle(button).visibility!=='hidden';
  });
  for(const name of ['height','font','font-size','font-weight','spacing','bg','fg'])this.host.style.removeProperty('--action-'+name);
  if(!reference)return;
  const native=getComputedStyle(reference);const text=reference.querySelector<HTMLElement>('.yt-spec-button-shape-next__button-text-content,.yt-core-attributed-string');const type=getComputedStyle(text??reference);
  const height=parseFloat(native.height);
  if(height>=24&&height<=80)this.host.style.setProperty('--action-height',native.height);
  this.host.style.setProperty('--action-font',type.fontFamily);
  if(parseFloat(type.fontSize)>=10)this.host.style.setProperty('--action-font-size',type.fontSize);
  this.host.style.setProperty('--action-font-weight',type.fontWeight);
  this.host.style.setProperty('--action-spacing',type.letterSpacing);
  if(native.backgroundColor!=='rgba(0, 0, 0, 0)'&&native.backgroundColor!=='transparent')this.host.style.setProperty('--action-bg',native.backgroundColor);
  this.host.style.setProperty('--action-fg',native.color);
 }
 private place(){
  if(this.disposed)return;
  this.host.toggleAttribute('data-dark',document.documentElement.hasAttribute('dark'));
  const watch=location.pathname==='/watch'&&new URL(location.href).searchParams.has('v');
  const target=watch&&window.innerWidth>=840?selectors.map(s=>document.querySelector<HTMLElement>(s)).find(el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&!el.closest('[hidden]')&&getComputedStyle(el).visibility!=='hidden';}):undefined;
  if(target&&this.host.parentElement!==target){this.resize?.disconnect();this.host.remove();target.append(this.host);this.resize?.observe(target);}
  if(!target){this.resize?.disconnect();this.host.remove();}
  if(target)this.matchNeighbor(target);
  this.host.style.position='static';
  const rect=target?.getBoundingClientRect();const occupied=this.host.getBoundingClientRect();
  const fits=!!target&&!!rect&&occupied.width>0&&occupied.height>0&&rect.right<=window.innerWidth-8&&occupied.right<=window.innerWidth-8&&target.scrollWidth<=target.clientWidth+1;
  // Keep a hidden host in a constrained target so later resize can restore it without an append loop.
  this.host.style.visibility=fits?'visible':'hidden';this.button.disabled=!fits;this.host.style.position=fits?'static':'absolute';
  if(this.placed!==fits){this.placed=fits;this.placement(fits);}
 }
 dispose(){this.disposed=true;if(this.frame!==undefined)cancelAnimationFrame(this.frame);this.observer.disconnect();this.resize?.disconnect();window.removeEventListener('resize',this.schedule);window.removeEventListener('popstate',this.schedule);document.removeEventListener('yt-navigate-finish',this.schedule);this.button.removeEventListener('click',this.click);this.host.remove();if(this.placed)this.placement(false);}
}
