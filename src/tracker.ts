export function videoId(url:string):string|null {const u=new URL(url); return u.pathname==='/watch'?u.searchParams.get('v'):null;}
/** Credit only forward media movement consistent with elapsed wall time and playback speed. */
export class WatchTracker {
 watched=0; private position=0; private wall=0; private running=false; private seeking=false; private speed=1; handled=false;
 sample(position:number,now:number,playing:boolean,rate=1){
  const elapsed=Math.max(0,(now-this.wall)/1000); const delta=position-this.position;
  if(this.running&&!this.seeking&&delta>0&&delta<=elapsed*this.speed+0.35){this.watched+=Math.min(elapsed,delta/this.speed);}
  this.position=position;this.wall=now;this.running=playing;this.speed=rate;
 }
 seek(position:number,now:number,seeking:boolean){this.seeking=seeking;this.position=position;this.wall=now;}
 end(duration:number){if(this.handled||!Number.isFinite(duration)||duration<=0||this.watched<30||this.watched<duration*0.7)return false;this.handled=true;return true;}
}
