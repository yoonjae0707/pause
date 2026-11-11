import {fullscreenTarget} from './fullscreen-target';
/** Optional recommendation-column placement; the main app and reflection stay outside YouTube layout. */
export class SidebarEntry {
 private observer:MutationObserver;private resize:ResizeObserver|undefined;private frame:number|undefined;private placed=false;private disposed=false;
 constructor(private host:HTMLElement,private placement:(value:boolean)=>void){
  this.observer=new MutationObserver(records=>{if(records.some(r=>{
   if(r.target===host)return false;
   if(r.target===host.parentElement||(r.target instanceof Element&&r.target.matches('#secondary,#secondary-inner,ytd-watch-flexy,#movie_player,.html5-video-player')))return true;
   if(r.type==='attributes')return r.target instanceof Element&&r.target.matches('ytd-watch-flexy,#secondary,#secondary-inner');
   return [...r.addedNodes,...r.removedNodes].some(n=>n instanceof Element&&(n.matches('ytd-watch-flexy,#secondary,#secondary-inner')||!!n.querySelector('ytd-watch-flexy,#secondary,#secondary-inner')));
  }))this.schedule();});
  this.observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style','class']});
  if(typeof ResizeObserver!=='undefined')this.resize=new ResizeObserver(this.schedule);
  window.addEventListener('resize',this.schedule);window.addEventListener('popstate',this.schedule);document.addEventListener('yt-navigate-finish',this.schedule);document.addEventListener('fullscreenchange',this.schedule);this.schedule();
 }
 private schedule=()=>{if(this.disposed||this.frame!==undefined)return;this.frame=requestAnimationFrame(()=>{this.frame=undefined;this.refresh();});};
 refresh(){if(this.disposed)return;let target:HTMLElement|undefined;
  if(!fullscreenTarget()&&location.pathname==='/watch'&&innerWidth>=1000)target=['ytd-watch-flexy #secondary #secondary-inner','ytd-watch-flexy #secondary-inner','ytd-watch-flexy #secondary'].map(s=>document.querySelector<HTMLElement>(s)).find((el):el is HTMLElement=>!!el&&el.getBoundingClientRect().width>=280&&el.getBoundingClientRect().height>0&&!el.closest('[hidden]')&&getComputedStyle(el).visibility!=='hidden');
  try{if(target){if(this.host.parentElement!==target||target.firstElementChild!==this.host){target.prepend(this.host);this.resize?.disconnect();this.resize?.observe(target);}}else{this.resize?.disconnect();this.host.remove();}}catch{target=undefined;this.host.remove();}
  if(this.placed!==!!target){this.placed=!!target;this.placement(this.placed);}
 }
 dispose(){this.disposed=true;if(this.frame!==undefined)cancelAnimationFrame(this.frame);this.observer.disconnect();this.resize?.disconnect();window.removeEventListener('resize',this.schedule);window.removeEventListener('popstate',this.schedule);document.removeEventListener('yt-navigate-finish',this.schedule);document.removeEventListener('fullscreenchange',this.schedule);this.host.remove();}
}
