import {describe,it,expect} from 'vitest';
import {WatchTracker,videoId} from '../src/tracker';
function play(t:WatchTracker,seconds:number,start=0,wall=0){t.sample(start,wall,true);for(let i=1;i<=seconds;i++)t.sample(start+i,wall+i*1000,true);}
describe('actual playback',()=>{
 it('requires both 30 seconds and 70 percent; ends once',()=>{const t=new WatchTracker();play(t,69);expect(t.end(100)).toBe(false);t.sample(70,70000,false);expect(t.end(100)).toBe(true);expect(t.end(100)).toBe(false);});
 it('short video cannot pass the 30 second minimum',()=>{const t=new WatchTracker();play(t,29);expect(t.end(29)).toBe(false);});
 it('rejects seek jumps including jumps without seeking events',()=>{const t=new WatchTracker();play(t,10);t.seek(95,11000,true);t.sample(99,12000,true);t.seek(99,12000,false);t.sample(100,13000,false);expect(t.watched).toBe(11);expect(t.end(100)).toBe(false);const other=new WatchTracker();play(other,5);other.sample(100,6000,false);expect(other.watched).toBe(5);});
 it('does not credit paused wall time',()=>{const t=new WatchTracker();play(t,10);t.sample(10,10000,false);t.sample(10,90000,true);t.sample(11,91000,false);expect(t.watched).toBe(11);});
 it('counts real elapsed playback at 2x, not seek distance',()=>{const t=new WatchTracker();t.sample(0,0,true,2);t.sample(2,1000,true,2);expect(t.watched).toBe(1);});
 it('excludes shorts, playlists and homepage',()=>{expect(videoId('https://www.youtube.com/watch?v=abc&list=x')).toBe('abc');expect(videoId('https://www.youtube.com/shorts/abc')).toBeNull();});
});
it('does not double credit duplicate samples or a same-position rebind',()=>{const t=new WatchTracker();t.sample(0,0,true);for(let i=1;i<=40;i++){t.sample(i,i*1000,true);t.sample(i,i*1000,true);t.seek(i,i*1000,false);t.sample(i,i*1000,true);}expect(t.watched).toBe(40);expect(t.end(40)).toBe(true);expect(t.end(40)).toBe(false);});
