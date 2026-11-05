// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act,createElement} from 'react';
import {createRoot} from 'react-dom/client';
it('persists first input metadata through app reload and saves 204 at 252 without changing legacy notes',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();
 const old={id:'old',videoId:'a',text:'old note',seconds:17,createdAt:1};const rows:Record<string,unknown>={'pause:v1:note:old':old};const listeners=new Set<()=>void>();
 vi.stubGlobal('chrome',{storage:{local:{get:async()=>structuredClone(rows),set:async(items:Record<string,unknown>)=>{Object.assign(rows,structuredClone(items));listeners.forEach(f=>f());}},onChanged:{addListener:(f:()=>void)=>listeners.add(f),removeListener:(f:()=>void)=>listeners.delete(f)}}});
 history.replaceState({},'','/watch?v=a');document.body.innerHTML='<h1 class="ytd-watch-metadata">Original A</h1><video></video>';const video=document.querySelector('video')!;Object.defineProperty(video,'readyState',{value:1});video.currentTime=180;
 let content:typeof import('../src/content');await act(async()=>{content=await import('../src/content');});const shadow=document.getElementById('pause-extension')!.shadowRoot!;
 const open=async()=>{await act(async()=>{(shadow.querySelector('.notes-button') as HTMLButtonElement).click();});};await open();(shadow.querySelector('textarea') as HTMLTextAreaElement).focus();expect(rows['pause:v1:draftCapture:a']).toBeUndefined();
 const edit=async(value:string)=>{const el=shadow.querySelector('textarea')!;const key=Object.keys(el).find(k=>k.startsWith('__reactProps'))!;await act(async()=>{(el as any)[key].onChange({target:{value}});});};
 await edit('   ');expect(rows['pause:v1:draftCapture:a']).toBeNull();video.currentTime=204;await edit('안녕하세요 123 456');await act(async()=>{content!.contentRoot.unmount();});
 video.currentTime=252;document.querySelector('h1')!.textContent='Later title';const mount=document.createElement('div');shadow.append(mount);const root=createRoot(mount);await act(async()=>{root.render(createElement(content!.App));});await open();
 expect((shadow.querySelector('textarea') as HTMLTextAreaElement).value).toBe('안녕하세요 123 456');await act(async()=>{(shadow.querySelector('.panel .primary') as HTMLButtonElement).click();});
 const saved=Object.entries(rows).filter(([k])=>k.startsWith('pause:v1:note:')&&k!=='pause:v1:note:old')[0][1] as any;
 expect(saved.seconds).toBe(204);expect(saved.timestampSeconds).toBe(204);expect(saved.createdAt).toBeGreaterThan(1);expect((rows['pause:v1:video:a'] as any).title).toBe('Original A');expect(rows['pause:v1:note:old']).toEqual(old);expect(rows['pause:v1:draftCapture:a']).toBeNull();
 await act(async()=>{root.unmount();});vi.useRealTimers();vi.unstubAllGlobals();
});
