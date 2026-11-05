import {diagnostic} from './diagnostics';
import { videoId,WatchTracker } from './tracker';
export interface PlaybackContext {id:string; video:HTMLVideoElement; tracker:WatchTracker; title?:string; duration?:number; position?:number; adHint?:boolean}
export class Controller {
 current:PlaybackContext|null=null; private cleanup=()=>{}; private observer:MutationObserver; private timer:ReturnType<typeof setInterval>; private trackers=new Map<string,WatchTracker>();
 private suspended=false; private navigatingUntil=0;
 constructor(private changed:(ctx:PlaybackContext|null)=>void,private ended:(ctx:PlaybackContext)=>boolean|void){
  this.observer=new MutationObserver(()=>this.sync());this.observer.observe(document.documentElement,{childList:true,subtree:true});
  this.timer=setInterval(()=>this.sync(),500);document.addEventListener('yt-navigate-start',this.navigationStart);document.addEventListener('yt-navigate-finish',this.navigationFinish);window.addEventListener('popstate',this.navigationFinish);this.sync();
 }
 private navigationStart=()=>{diagnostic('spa-start',{videoId:this.current?.id});this.complete(this.current,'spa-boundary');this.navigatingUntil=performance.now()+5000;this.cleanup();this.cleanup=()=>{};this.current=null;this.changed(null);};
 private navigationFinish=()=>{diagnostic('spa-finish');this.navigatingUntil=0;this.sync();};
 private complete(ctx:PlaybackContext|null,source:string){
  if(!ctx)return;
  const {video,tracker}=ctx;
  const duration=ctx.duration??video.duration;
  const position=ctx.position??video.currentTime;
  const adHint=ctx.adHint||!!document.querySelector('#movie_player.ad-showing');
  const reason=this.suspended?'suspended':tracker.handled?'already-handled':!Number.isFinite(duration)||duration<=0?'unknown-duration':tracker.watched<30?'under-30s':tracker.watched<duration*.7?'under-70-percent':source!=='ended'&&!video.ended&&(video.seeking||position<duration-.25)?'not-at-end':'eligible';
  diagnostic(source,{videoId:ctx.id,duration,position,watched:tracker.watched,ratio:tracker.watched/duration,ended:video.ended,adHint,reason});
  if(reason!=='eligible')return;
  if(tracker.end(duration)){
   const accepted=this.ended(ctx);
   if(accepted===false)tracker.handled=false;
  }
 }
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
  if(this.current?.id===id&&this.current?.video===video){if(video?.ended)this.complete(this.current,'ended-poll');return;}
  this.complete(this.current,'binding-boundary');diagnostic('binding-change',{videoId:this.current?.id});this.cleanup();this.current=null;
  if(id&&video){
   const tracker=this.trackers.get(id)??new WatchTracker();this.trackers.set(id,tracker);
   // Rebinding must not credit the gap between elements or URLs.
   tracker.seek(video.currentTime,performance.now(),false);tracker.sample(video.currentTime,performance.now(),!this.suspended&&!video.paused&&!video.ended,video.playbackRate);
   const ctx:PlaybackContext={id,video,tracker,title:document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim()||document.title,duration:video.duration,position:video.currentTime};this.current=ctx;
   const valid=()=>!this.navigatingUntil&&video.isConnected&&videoId(location.href)===id;
   const sample=()=>{if(valid()){
    tracker.sample(video.currentTime,performance.now(),!this.suspended&&!video.paused&&!video.ended,video.playbackRate);
    ctx.duration=video.duration;ctx.position=video.currentTime;ctx.adHint=!!document.querySelector('#movie_player.ad-showing');
    diagnostic('sample',{videoId:id,duration:ctx.duration,position:ctx.position,watched:tracker.watched,ratio:tracker.watched/video.duration,adHint:ctx.adHint});
   }};
   const seeking=()=>{diagnostic('seeking',{videoId:id,position:video.currentTime});tracker.seek(video.currentTime,performance.now(),true);};
   const seeked=()=>{diagnostic('seeked',{videoId:id,position:video.currentTime});tracker.seek(video.currentTime,performance.now(),false);sample();};
   const reset=()=>{diagnostic('source-reset',{videoId:id,watched:tracker.watched});ctx.position=video.currentTime;ctx.duration=video.duration;tracker.seek(video.currentTime,performance.now(),false);tracker.sample(video.currentTime,performance.now(),false,video.playbackRate);};
   const end=()=>{if(valid())sample();this.complete(ctx,'ended');};
   const events:{[key:string]:()=>void}={timeupdate:sample,play:sample,pause:sample,ratechange:sample,seeking,seeked,loadstart:reset,emptied:reset,ended:end};
   for(const [event,handler]of Object.entries(events))video.addEventListener(event,handler);
   this.cleanup=()=>{sample();for(const [event,handler]of Object.entries(events))video.removeEventListener(event,handler);};
  }
  this.changed(this.current);
 };
 dispose(){this.cleanup();this.observer.disconnect();clearInterval(this.timer);document.removeEventListener('yt-navigate-start',this.navigationStart);document.removeEventListener('yt-navigate-finish',this.navigationFinish);window.removeEventListener('popstate',this.navigationFinish);}
}
