/** Move the existing app host, not its React tree, into the fullscreen top layer. */
export class FullscreenUI {
 private entry=document.createElement('span');private button:HTMLButtonElement;private observer:MutationObserver;private frame:number|undefined;private disposed=false;
 constructor(private appHost:HTMLElement,private toggle:()=>void,private changed:(active:boolean,placed:boolean)=>void){
  this.entry.dataset.pauseFullscreen='true';const root=this.entry.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=':host{display:inline-flex;vertical-align:top;align-items:center;justify-content:center;width:48px;height:100%;min-height:36px}button{appearance:none;display:grid;place-items:center;width:100%;height:100%;min-height:36px;margin:0;padding:0;border:0;background:transparent;color:#fff;cursor:pointer;opacity:.9}button:hover{opacity:1}button:focus-visible{outline:2px solid white;outline-offset:-4px}svg{width:24px;height:24px;filter:drop-shadow(0 1px 2px #0008)}';root.append(style);
  this.button=document.createElement('button');this.button.type='button';this.button.title='PAUSE Notes';this.button.setAttribute('aria-label','PAUSE Notes 열기 또는 닫기');this.button.setAttribute('aria-expanded','false');this.button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z M14 3v6h6 M9 12v5 M14 12v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';root.append(this.button);this.button.addEventListener('click',this.click);
  this.observer=new MutationObserver(records=>{if(records.some(r=>r.target!==this.entry&&[...r.addedNodes,...r.removedNodes].some(n=>n instanceof Element&&(n.matches('.ytp-chrome-bottom,.ytp-right-controls')||!!n.querySelector('.ytp-right-controls')))))this.schedule();});
  this.observer.observe(document.documentElement,{subtree:true,childList:true});document.addEventListener('fullscreenchange',this.sync);document.addEventListener('yt-navigate-finish',this.sync);window.addEventListener('popstate',this.sync);this.sync();
 }
 private click=(event:MouseEvent)=>{event.stopPropagation();this.toggle();};
 private schedule=()=>{if(this.disposed||this.frame!==undefined)return;this.frame=requestAnimationFrame(()=>{this.frame=undefined;this.sync();});};
 setExpanded(open:boolean){this.button.setAttribute('aria-expanded',String(open));}
 sync=()=>{
  if(this.disposed)return;
  const full=document.fullscreenElement;const active=full instanceof HTMLElement&&full!==this.appHost&&!(full instanceof HTMLVideoElement)&&location.pathname==='/watch';
  const parent=active?full:document.documentElement;
  if(this.appHost.parentElement!==parent)parent.append(this.appHost);
  this.appHost.toggleAttribute('data-fullscreen',active);
  const controls=active?full.querySelector<HTMLElement>('.ytp-right-controls'):null;
  if(controls){const last=controls.querySelector('.ytp-fullscreen-button');if(this.entry.parentElement!==controls)controls.insertBefore(this.entry,last?.parentElement===controls?last:null);}
  else this.entry.remove();
  this.changed(active,!!controls);
 };
 dispose(){this.disposed=true;if(this.frame!==undefined)cancelAnimationFrame(this.frame);this.observer.disconnect();document.removeEventListener('fullscreenchange',this.sync);document.removeEventListener('yt-navigate-finish',this.sync);window.removeEventListener('popstate',this.sync);this.button.removeEventListener('click',this.click);this.entry.remove();this.appHost.removeAttribute('data-fullscreen');if(this.appHost.parentElement!==document.documentElement)document.documentElement.append(this.appHost);}
}
