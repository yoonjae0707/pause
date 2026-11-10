import {materialActionCSS} from './material-theme';
const selectors=[
 'ytd-watch-metadata #actions #top-level-buttons-computed',
 'ytd-watch-metadata #actions-inner #top-level-buttons-computed',
 'ytd-watch-flexy #above-the-fold #actions ytd-menu-renderer #top-level-buttons-computed',
];
const css=`:host{display:inline-flex;flex:0 0 auto;margin-inline-start:8px;color:#173f30}button{display:inline-flex;align-items:center;gap:7px;white-space:nowrap;border:1px solid #b3cbbb;background:#e3eee6;color:inherit;border-radius:999px;padding:0 14px;height:36px;font:600 14px system-ui;cursor:pointer}button:hover{background:#cedfd2}button:focus-visible{outline:3px solid #358760;outline-offset:2px}button:disabled{opacity:.45;cursor:default}:host([data-dark]){color:#d6eddd}:host([data-dark]) button{background:#254735;border-color:#557260}:host([data-dark]) button:hover{background:#355f46}@media(forced-colors:active){button{border:1px solid ButtonText;color:ButtonText;background:ButtonFace}}`;
/** A bounded selector set, one coalesced refresh per frame, no polling or document-wide queries. */
export class ActionEntry {
 private host=document.createElement('span');private button:HTMLButtonElement;private observer:MutationObserver;private resize:ResizeObserver|undefined;private frame:number|undefined;private disposed=false;private placed=false;
 constructor(private toggle:()=>void,private placement:(placed:boolean)=>void){
  this.host.dataset.pauseAction='true';const root=this.host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=css+materialActionCSS;root.append(style);
  this.button=document.createElement('button');this.button.type='button';this.button.setAttribute('aria-label','PAUSE Note — 영상 메모');this.button.setAttribute('aria-expanded','false');this.button.innerHTML='<span aria-hidden="true">Ⅱ</span><span>PAUSE Note</span>';this.button.title='PAUSE 확장 프로그램 · 영상 메모';root.append(this.button);this.button.addEventListener('click',this.click);
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
 private place(){
  if(this.disposed)return;
  this.host.toggleAttribute('data-dark',document.documentElement.hasAttribute('dark'));
  const watch=location.pathname==='/watch'&&new URL(location.href).searchParams.has('v');
  const target=watch&&window.innerWidth>=840?selectors.map(s=>document.querySelector<HTMLElement>(s)).find(el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&!el.closest('[hidden]')&&getComputedStyle(el).visibility!=='hidden';}):undefined;
  if(target&&this.host.parentElement!==target){this.resize?.disconnect();this.host.remove();target.append(this.host);this.resize?.observe(target);}
  if(!target){this.resize?.disconnect();this.host.remove();}
  this.host.style.position='static';
  const rect=target?.getBoundingClientRect();const occupied=this.host.getBoundingClientRect();
  const fits=!!target&&!!rect&&occupied.width>0&&occupied.height>0&&rect.right<=window.innerWidth-8&&occupied.right<=window.innerWidth-8&&target.scrollWidth<=target.clientWidth+1;
  // Keep a hidden host in a constrained target so later resize can restore it without an append loop.
  this.host.style.visibility=fits?'visible':'hidden';this.button.disabled=!fits;this.host.style.position=fits?'static':'absolute';
  if(this.placed!==fits){this.placed=fits;this.placement(fits);}
 }
 dispose(){this.disposed=true;if(this.frame!==undefined)cancelAnimationFrame(this.frame);this.observer.disconnect();this.resize?.disconnect();window.removeEventListener('resize',this.schedule);window.removeEventListener('popstate',this.schedule);document.removeEventListener('yt-navigate-finish',this.schedule);this.button.removeEventListener('click',this.click);this.host.remove();if(this.placed)this.placement(false);}
}
