import { videoId,WatchTracker } from './tracker';
export interface PlaybackContext {id:string; video:HTMLVideoElement; tracker:WatchTracker}
export class Controller {
 current:PlaybackContext|null=null; private cleanup=()=>{}; private observer:MutationObserver; private timer:ReturnType<typeof setInterval>; private trackers=new Map<string,WatchTracker>();
 constructor(private changed:(ctx:PlaybackContext|null)=>void,private ended:(ctx:PlaybackContext)=>void){
  this.observer=new MutationObserver(()=>this.sync());this.observer.observe(document.documentElement,{childList:true,subtree:true});
  this.timer=setInterval(()=>this.sync(),500);document.addEventListener('yt-navigate-finish',this.sync);window.addEventListener('popstate',this.sync);this.sync();
 }
 sync=()=>{
  const id=videoId(location.href);const video=document.querySelector<HTMLVideoElement>('video.html5-main-video')??document.querySelector('video');
  if(this.current?.id===id&&this.current?.video===video)return;
  this.cleanup();this.current=null;
  if(id&&video){
   const tracker=this.trackers.get(id)??new WatchTracker();this.trackers.set(id,tracker);
   // Rebinding must not credit the gap between elements or URLs.
   tracker.seek(video.currentTime,performance.now(),false);tracker.sample(video.currentTime,performance.now(),!video.paused,video.playbackRate);
   const ctx={id,video,tracker};this.current=ctx;
   const sample=()=>tracker.sample(video.currentTime,performance.now(),!video.paused&&!video.ended,video.playbackRate);
   const seeking=()=>tracker.seek(video.currentTime,performance.now(),true);
   const seeked=()=>{tracker.seek(video.currentTime,performance.now(),false);sample();};
   const end=()=>{sample();if(tracker.end(video.duration))this.ended(ctx);};
   const events:{[key:string]:()=>void}={timeupdate:sample,play:sample,pause:sample,ratechange:sample,seeking,seeked,ended:end};
   for(const [event,handler]of Object.entries(events))video.addEventListener(event,handler);
   this.cleanup=()=>{sample();for(const [event,handler]of Object.entries(events))video.removeEventListener(event,handler);};
  }
  this.changed(this.current);
 };
 dispose(){this.cleanup();this.observer.disconnect();clearInterval(this.timer);document.removeEventListener('yt-navigate-finish',this.sync);window.removeEventListener('popstate',this.sync);}
}
