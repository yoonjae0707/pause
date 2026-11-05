// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act} from 'react';
it('shows only one overlay, permits immediate reflection saving, delays skip for 5 seconds',async()=>{
 vi.useFakeTimers();(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 const rows:Record<string,unknown>={};const listeners=new Set<()=>void>();
 vi.stubGlobal('chrome',{storage:{local:{get:async()=>structuredClone(rows),set:async(items:Record<string,unknown>)=>{Object.assign(rows,items);listeners.forEach(f=>f());}},onChanged:{addListener:(f:()=>void)=>listeners.add(f),removeListener:(f:()=>void)=>listeners.delete(f)}}});
 history.replaceState({},'','/watch?v=a');document.body.innerHTML='<h1 class="ytd-watch-metadata">Test video</h1><video></video>';
 const video=document.querySelector('video')!;Object.defineProperty(video,'duration',{value:40});Object.defineProperty(video,'paused',{value:false,configurable:true});video.pause=vi.fn();
 let content:typeof import('../src/content');
 await act(async()=>{content=await import('../src/content');});
 await act(async()=>{video.dispatchEvent(new Event('play'));});
 for(let i=1;i<=40;i++)await act(async()=>{vi.advanceTimersByTime(1000);video.currentTime=i;video.dispatchEvent(new Event('timeupdate'));});
 await act(async()=>{video.dispatchEvent(new Event('ended'));video.dispatchEvent(new Event('ended'));});
 const root=document.getElementById('pause-extension')!.shadowRoot!;
 expect(root.querySelectorAll('[role="dialog"]').length).toBe(1);
 let buttons=Array.from(root.querySelectorAll('.dialog button'));
 expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
 const textarea=root.querySelector('.dialog textarea') as HTMLTextAreaElement;
 await act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(textarea,'A useful thought');textarea.dispatchEvent(new Event('input',{bubbles:true,composed:true}));});
 // React input events in jsdom are synthetic; use its onChange prop to exercise the save path.
 const propsKey=Object.keys(textarea).find(k=>k.startsWith('__reactProps'))!;
 await act(async()=>{(textarea as any)[propsKey].onChange({target:{value:'A useful thought'}});});
 expect((root.querySelector('.dialog button') as HTMLButtonElement).disabled).toBe(false);
 await act(async()=>{(root.querySelector('.dialog button') as HTMLButtonElement).click();});
 expect(Object.keys(rows).some(k=>k.startsWith('pause:v1:reflection:'))).toBe(true);
 expect(root.querySelector('[role="dialog"]')).toBeNull();
 // A new video receives an independent intervention.
 await act(async()=>{history.pushState({},'','/watch?v=b');video.currentTime=0;document.dispatchEvent(new Event('yt-navigate-finish'));});
 for(let i=1;i<=40;i++)await act(async()=>{vi.advanceTimersByTime(1000);video.currentTime=i;video.dispatchEvent(new Event('timeupdate'));});
 await act(async()=>{video.dispatchEvent(new Event('ended'));});
 buttons=Array.from(root.querySelectorAll('.dialog button'));expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
 const next=document.createElement('video');Object.defineProperty(next,'paused',{value:false,writable:true});
 next.pause=vi.fn(()=>{Object.defineProperty(next,'paused',{value:true,writable:true});});next.play=vi.fn(async()=>{});
 await act(async()=>{history.pushState({},'','/watch?v=autoplay');video.replaceWith(next);document.dispatchEvent(new Event('yt-navigate-finish'));});
 expect(next.pause).toHaveBeenCalledTimes(1);
 await act(async()=>{vi.advanceTimersByTime(5000);});
 expect((root.querySelectorAll('.dialog button')[1] as HTMLButtonElement).disabled).toBe(false);
 await act(async()=>{(root.querySelectorAll('.dialog button')[1] as HTMLButtonElement).click();});
 expect(root.querySelector('[role="dialog"]')).toBeNull();expect(next.play).toHaveBeenCalledTimes(1);await act(async()=>{content!.contentRoot.unmount();});vi.useRealTimers();
});
