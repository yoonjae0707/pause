import { videoId,WatchTracker } from './tracker';
export interface PlaybackContext {id:string; video:HTMLVideoElement; tracker:WatchTracker}
export class Controller {
 current:PlaybackContext|null=null; private cleanup=()=>{}; private observer:MutationObserver; private timer:ReturnType<typeof setInterval>; private trackers=new Map<string,WatchTracker>();
 private suspended=false; private navigatingUntil=0;
 constructor(private changed:(ctx:PlaybackContext|null)=>void,private ended:(ctx:PlaybackContext)=>void){
  this.observer=new MutationObserver(()=>this.sync());this.observer.observe(document.documentElement,{childList:true,subtree:true});
  this.timer=setInterval(()=>this.sync(),500);document.addEventListener('yt-navigate-start',this.navigationStart);document.addEventListener('yt-navigate-finish',this.navigationFinish);window.addEventListener('popstate',this.navigationFinish);this.sync();
 }
 private navigationStart=()=>{this.navigatingUntil=performance.now()+5000;this.cleanup();this.cleanup=()=>{};this.current=null;this.changed(null);};
 private navigationFinish=()=>{this.navigatingUntil=0;this.sync();};
 setSuspended(value:boolean){
  if(value===this.suspended)return;
  const c=this.current;
  if(c){c.tracker.sample(c.video.currentTime,performance.now(),false,c.video.playbackRate);c.tracker.seek(c.video.currentTime,performance.now(),false);}
  this.suspended=value;
  if(c)c.tracker.sample(c.video.currentTime,performance.now(),!value&&!c.video.paused&&!c.video.ended,c.video.playbackRate);
 }
 sync=()=>{
  if(performance.now()<this.navigatingUntil)return;
  this.navigatingUntil=0;
  const id=videoId(location.href);const video=document.querySelector<HTMLVideoElement>('video.html5-main-video')??document.querySelector('video');
  if(this.current?.id===id&&this.current?.video===video)return;
  this.cleanup();this.current=null;
  if(id&&video){
   const tracker=this.trackers.get(id)??new WatchTracker();this.trackers.set(id,tracker);
   // Rebinding must not credit the gap between elements or URLs.
   tracker.seek(video.currentTime,performance.now(),false);tracker.sample(video.currentTime,performance.now(),!this.suspended&&!video.paused&&!video.ended,video.playbackRate);
   const ctx={id,video,tracker};this.current=ctx;
   const valid=()=>!this.navigatingUntil&&video.isConnected&&videoId(location.href)===id;
   const sample=()=>{if(valid())tracker.sample(video.currentTime,performance.now(),!this.suspended&&!video.paused&&!video.ended,video.playbackRate);};
   const seeking=()=>tracker.seek(video.currentTime,performance.now(),true);
   const seeked=()=>{tracker.seek(video.currentTime,performance.now(),false);sample();};
   const reset=()=>{tracker.seek(video.currentTime,performance.now(),false);tracker.sample(video.currentTime,performance.now(),false,video.playbackRate);};
   const end=()=>{if(!valid()||this.suspended)return;sample();if(tracker.end(video.duration))this.ended(ctx);};
   const events:{[key:string]:()=>void}={timeupdate:sample,play:sample,pause:sample,ratechange:sample,seeking,seeked,loadstart:reset,emptied:reset,ended:end};
   for(const [event,handler]of Object.entries(events))video.addEventListener(event,handler);
   this.cleanup=()=>{sample();for(const [event,handler]of Object.entries(events))video.removeEventListener(event,handler);};
  }
  this.changed(this.current);
 };
 dispose(){this.cleanup();this.observer.disconnect();clearInterval(this.timer);document.removeEventListener('yt-navigate-start',this.navigationStart);document.removeEventListener('yt-navigate-finish',this.navigationFinish);window.removeEventListener('popstate',this.navigationFinish);}
}
