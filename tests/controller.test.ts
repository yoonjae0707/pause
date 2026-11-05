// @vitest-environment jsdom
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {Controller} from '../src/controller';
let controller:Controller|undefined;
beforeEach(()=>{vi.useFakeTimers();history.replaceState({},'','/watch?v=a');document.body.innerHTML='<video class="html5-main-video"></video>';});
afterEach(()=>{controller?.dispose();vi.useRealTimers();});
function event(v:HTMLVideoElement,type:string,time:number){Object.defineProperty(v,'currentTime',{value:time,writable:true,configurable:true});v.dispatchEvent(new Event(type));}
it('rebinds on URL changes and element replacement, ignores old element events',()=>{const changed=vi.fn(),ended=vi.fn();controller=new Controller(changed,ended);const old=controller.current!.video;history.pushState({},'','/watch?v=b');document.dispatchEvent(new Event('yt-navigate-finish'));expect(controller.current!.id).toBe('b');const next=document.createElement('video');old.replaceWith(next);controller.sync();expect(controller.current!.video).toBe(next);old.dispatchEvent(new Event('ended'));expect(ended).not.toHaveBeenCalled();history.pushState({},'','/shorts/c');controller.sync();expect(controller.current).toBeNull();});
it('emits one valid intervention even after video replacement and returning to the same ID',()=>{const ended=vi.fn();controller=new Controller(()=>{},ended);const v=controller.current!.video;Object.defineProperty(v,'duration',{value:40});Object.defineProperty(v,'paused',{value:false});event(v,'play',0);for(let i=1;i<=40;i++){vi.advanceTimersByTime(1000);event(v,'timeupdate',i);}event(v,'ended',40);event(v,'ended',40);expect(ended).toHaveBeenCalledTimes(1);const next=document.createElement('video');Object.defineProperty(next,'duration',{value:40});v.replaceWith(next);controller.sync();event(next,'ended',40);history.pushState({},'','/watch?v=b');controller.sync();history.pushState({},'','/watch?v=a');controller.sync();event(next,'ended',40);expect(ended).toHaveBeenCalledTimes(1);});
it('does not duplicate listeners on repeated sync and removes every binding on replace/dispose',()=>{
 const old=document.querySelector('video')!;const added=vi.spyOn(old,'addEventListener');const removed=vi.spyOn(old,'removeEventListener');
 controller=new Controller(()=>{},()=>{});const count=added.mock.calls.length;
 for(let i=0;i<20;i++)controller.sync();expect(added).toHaveBeenCalledTimes(count);
 const replacement=document.createElement('video');old.replaceWith(replacement);controller.sync();
 for(const [name,listener] of added.mock.calls)expect(removed.mock.calls.some(([n,l])=>n===name&&l===listener)).toBe(true);
 const tracker=controller.current!.tracker;old.dispatchEvent(new Event('ended'));expect(tracker.handled).toBe(false);
 const nextRemoved=vi.spyOn(replacement,'removeEventListener');controller.dispose();expect(nextRemoved).toHaveBeenCalledTimes(count);
 const changed=controller.current;history.pushState({},'','/watch?v=after-dispose');document.dispatchEvent(new Event('yt-navigate-finish'));vi.advanceTimersByTime(1000);expect(controller.current).toBe(changed);
});
it('detaches during SPA navigation, rejects stale URL events, recovers cancelled navigation and browser back',()=>{
 const ended=vi.fn();controller=new Controller(()=>{},ended);const old=controller.current!.video;Object.defineProperty(old,'paused',{value:false});
 event(old,'play',0);vi.advanceTimersByTime(1000);event(old,'timeupdate',1);const tracker=controller.current!.tracker;
 document.dispatchEvent(new Event('yt-navigate-start'));expect(controller.current).toBeNull();vi.advanceTimersByTime(2000);event(old,'timeupdate',3);expect(tracker.watched).toBe(1);
 // No finish event: bounded fallback rebinds without crediting the detached gap.
 vi.advanceTimersByTime(3000);expect(controller.current!.id).toBe('a');expect(tracker.watched).toBe(1);
 history.pushState({},'','/watch?v=b');event(old,'ended',40);expect(ended).not.toHaveBeenCalled();controller.sync();expect(controller.current!.id).toBe('b');
 history.replaceState({},'','/watch?v=a');window.dispatchEvent(new PopStateEvent('popstate'));expect(controller.current!.tracker).toBe(tracker);
});
it('suspends credit and end interventions while reflection holds an autoplay video',()=>{
 const ended=vi.fn();controller=new Controller(()=>{},ended);const v=controller.current!.video;Object.defineProperty(v,'duration',{value:40});Object.defineProperty(v,'paused',{value:false});
 event(v,'play',0);vi.advanceTimersByTime(1000);event(v,'timeupdate',1);const t=controller.current!.tracker;
 controller.setSuspended(true);for(let i=2;i<=40;i++){vi.advanceTimersByTime(1000);event(v,'timeupdate',i);}event(v,'ended',40);expect(t.watched).toBe(1);expect(ended).not.toHaveBeenCalled();expect(t.handled).toBe(false);
 controller.setSuspended(false);for(let i=41;i<=70;i++){vi.advanceTimersByTime(1000);event(v,'timeupdate',i);}event(v,'ended',70);expect(ended).toHaveBeenCalledTimes(1);
});
it('resets the baseline on source loading rather than crediting the source replacement gap',()=>{
 controller=new Controller(()=>{},()=>{});const v=controller.current!.video;Object.defineProperty(v,'paused',{value:false});event(v,'play',0);vi.advanceTimersByTime(1000);event(v,'timeupdate',1);
 event(v,'emptied',0);vi.advanceTimersByTime(10000);event(v,'loadstart',5);event(v,'timeupdate',10);expect(controller.current!.tracker.watched).toBe(1);
 event(v,'play',10);vi.advanceTimersByTime(1000);event(v,'timeupdate',11);expect(controller.current!.tracker.watched).toBe(2);
});
