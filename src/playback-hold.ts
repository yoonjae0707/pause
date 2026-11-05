import type { PlaybackContext } from './controller';

/** Resume only a new video's playback that this intervention actually interrupted. */
export class PlaybackHold {
 private candidate:PlaybackContext|null=null;
 constructor(private originId:string){}
 hold(ctx:PlaybackContext|null){
  if(!ctx||ctx.video.paused||ctx.video.ended)return;
  if(ctx.id!==this.originId)this.candidate=ctx;
  ctx.video.pause();
 }
 async release(current:PlaybackContext|null,hasRequestedNavigation:boolean){
  const candidate=this.candidate;this.candidate=null;
  if(!hasRequestedNavigation&&candidate&&current?.id===candidate.id&&current.video===candidate.video&&current.video.isConnected&&!current.video.ended){
   await current.video.play();
  }
 }
}
