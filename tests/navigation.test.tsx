// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act} from 'react';
const {navigate}=vi.hoisted(()=>({navigate:vi.fn()}));vi.mock('../src/navigation',()=>({navigateTo:navigate}));
it('defers a requested watch link during reflection, then restores it after skip',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();
 vi.stubGlobal('chrome',{storage:{local:{get:async()=>({}),set:async()=>{}},onChanged:{addListener:()=>{},removeListener:()=>{}}}});
 history.replaceState({},'','/watch?v=original');document.body.innerHTML='<video></video><a href="/watch?v=requested">Next video</a>';
 const video=document.querySelector('video')!;Object.defineProperty(video,'duration',{value:40});Object.defineProperty(video,'paused',{value:false});video.pause=vi.fn();
 let content:typeof import('../src/content');await act(async()=>{content=await import('../src/content');});
 for(let i=1;i<=40;i++)await act(async()=>{vi.advanceTimersByTime(1000);video.currentTime=i;video.dispatchEvent(new Event('timeupdate'));});
 await act(async()=>{video.dispatchEvent(new Event('ended'));});
 const root=document.getElementById('pause-extension')!.shadowRoot!;
 let modifierBlocked=true;document.querySelector('a')!.addEventListener('click',e=>{modifierBlocked=e.defaultPrevented;e.preventDefault();},{once:true});const modified=new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true});document.querySelector('a')!.dispatchEvent(modified);expect(modifierBlocked).toBe(false);
 const click=new MouseEvent('click',{bubbles:true,cancelable:true});document.querySelector('a')!.dispatchEvent(click);expect(click.defaultPrevented).toBe(true);expect(navigate).not.toHaveBeenCalled();
 await act(async()=>{vi.advanceTimersByTime(5000);});
 await act(async()=>{(root.querySelectorAll('.dialog button')[1] as HTMLButtonElement).click();});
 expect(navigate).not.toHaveBeenCalled();await act(async()=>{vi.advanceTimersByTime(260);});
 expect(navigate).toHaveBeenCalledExactlyOnceWith(new URL('/watch?v=requested',location.origin).href);
 await act(async()=>{content!.contentRoot.unmount();});vi.useRealTimers();vi.unstubAllGlobals();
});
