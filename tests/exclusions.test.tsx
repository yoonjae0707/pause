// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act} from 'react';
import {Repository} from '../src/storage';
import {exclusionLabels} from '../src/model';
it('persists all four reasons independently, clears exclusions, and preserves existing records',async()=>{
 const rows:Record<string,unknown>={'pause:v1:note:legacy':{id:'legacy',videoId:'music',text:'old',seconds:204,createdAt:1}};const store={get:async()=>structuredClone(rows),set:async(data:Record<string,unknown>)=>{Object.assign(rows,structuredClone(data));}};const repo=new Repository(store);
 for(const category of Object.keys(exclusionLabels) as (keyof typeof exclusionLabels)[])await repo.excludeReflection(category,category);
 const restored=await new Repository(store).read();expect(Object.keys(restored.reflectionExclusions)).toHaveLength(4);expect(restored.notes[0].seconds).toBe(204);
 await repo.excludeReflection('music',null);expect((await repo.read()).reflectionExclusions.music).toBeUndefined();expect((await repo.read()).reflectionExclusions.lecture).toBe('lecture');
});
it('keeps Notes and timestamp saves available for an excluded video, suppresses only its reflection, and allows the next video',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();const rows:Record<string,unknown>={};const listeners=new Set<()=>void>();
 vi.stubGlobal('chrome',{storage:{local:{get:async()=>structuredClone(rows),set:async(data:Record<string,unknown>)=>{Object.assign(rows,structuredClone(data));listeners.forEach(f=>f());}},onChanged:{addListener:(f:()=>void)=>listeners.add(f),removeListener:(f:()=>void)=>listeners.delete(f)}}});
 history.replaceState({},'','/watch?v=a');document.body.innerHTML='<video></video>';const video=document.querySelector('video')!;Object.defineProperty(video,'duration',{value:40});Object.defineProperty(video,'readyState',{value:1});Object.defineProperty(video,'paused',{value:false});video.pause=vi.fn();
 let content:typeof import('../src/content');await act(async()=>{content=await import('../src/content');});const root=document.getElementById('pause-extension')!.shadowRoot!;
 await act(async()=>{(root.querySelector('.notes-button') as HTMLButtonElement).click();});expect(root.querySelector('select')).toBeNull();
 await act(async()=>{await new Repository().excludeReflection('a','music');});expect((await new Repository().read()).reflectionExclusions.a).toBe('music');
 video.currentTime=12;const textarea=root.querySelector('textarea')!;const key=Object.keys(textarea).find(k=>k.startsWith('__reactProps'))!;await act(async()=>{(textarea as any)[key].onChange({target:{value:'keep this note'}});});video.currentTime=20;
 await act(async()=>{(root.querySelector('.panel .primary') as HTMLButtonElement).click();});expect((await new Repository().read()).notes[0].seconds).toBe(12);
 // Reset the tracker baseline after the simulated seek; exclusions never alter eligibility policy.
 video.currentTime=0;video.dispatchEvent(new Event('seeking'));video.dispatchEvent(new Event('seeked'));
 for(let i=1;i<=40;i++)await act(async()=>{vi.advanceTimersByTime(1000);video.currentTime=i;video.dispatchEvent(new Event('timeupdate'));});await act(async()=>{video.dispatchEvent(new Event('ended'));});
 expect(root.querySelector('[role="dialog"]')).toBeNull();expect(root.querySelector('.notes-button')).not.toBeNull();
 await act(async()=>{history.pushState({},'','/watch?v=b');video.currentTime=0;document.dispatchEvent(new Event('yt-navigate-finish'));});
 for(let i=1;i<=40;i++)await act(async()=>{vi.advanceTimersByTime(1000);video.currentTime=i;video.dispatchEvent(new Event('timeupdate'));});await act(async()=>{video.dispatchEvent(new Event('ended'));});expect(root.querySelectorAll('[role="dialog"]')).toHaveLength(1);
 await act(async()=>{vi.advanceTimersByTime(5000);});await act(async()=>{(root.querySelectorAll('.dialog button')[1] as HTMLButtonElement).click();});await act(async()=>{vi.advanceTimersByTime(260);});expect(root.querySelector('[role="dialog"]')).toBeNull();
 await act(async()=>{content!.contentRoot.unmount();});vi.useRealTimers();vi.unstubAllGlobals();
});
