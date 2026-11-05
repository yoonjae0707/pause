// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act} from 'react';
it('preserves unsaved per-video drafts, saves captured metadata across navigation, and restores records on remount',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();
 const rows:Record<string,unknown>={};const listeners=new Set<()=>void>();let releaseDraft!:()=>void;const gate=new Promise<void>(resolve=>{releaseDraft=resolve;});let delay=true;
 vi.stubGlobal('chrome',{storage:{local:{get:async()=>structuredClone(rows),set:async(items:Record<string,unknown>)=>{if(delay&&items['pause:v1:draft:a'])await gate;Object.assign(rows,structuredClone(items));listeners.forEach(f=>f());}},onChanged:{addListener:(f:()=>void)=>listeners.add(f),removeListener:(f:()=>void)=>listeners.delete(f)}}});
 history.replaceState({},'','/watch?v=a');document.body.innerHTML='<h1 class="ytd-watch-metadata">Title A</h1><video></video>';const video=document.querySelector('video')!;video.currentTime=12;
 let module:typeof import('../src/content');await act(async()=>{module=await import('../src/content');});const root=document.getElementById('pause-extension')!.shadowRoot!;
 await act(async()=>{(root.querySelector('.notes-button') as HTMLButtonElement).click();});
 const edit=async(value:string)=>{const textarea=root.querySelector('.panel textarea')!;const key=Object.keys(textarea).find(k=>k.startsWith('__reactProps'))!;await act(async()=>{(textarea as any)[key].onChange({target:{value}});});};
 await edit('Draft A');
 await act(async()=>{(root.querySelector('.panel .primary') as HTMLButtonElement).click();});
 // The draft write blocks saving while navigation changes the page title and URL.
 await act(async()=>{document.querySelector('h1')!.textContent='Title B';history.pushState({},'','/watch?v=b');document.dispatchEvent(new Event('yt-navigate-finish'));});
 await act(async()=>{delay=false;releaseDraft();});
 expect((rows['pause:v1:video:a'] as any).title).toBe('Title A');expect(Object.values(rows).filter((x:any)=>x?.videoId==='a'&&x?.text==='Draft A')).toHaveLength(1);expect((rows['pause:v1:video:a'] as any).url).toContain('v=a');
 await edit('Unfinished B');
 await act(async()=>{history.pushState({},'','/watch?v=a');document.dispatchEvent(new Event('yt-navigate-finish'));});
 expect((root.querySelector('textarea') as HTMLTextAreaElement).value).toBe('');expect(root.querySelector('.note')!.textContent).toContain('Draft A');
 await act(async()=>{history.pushState({},'','/watch?v=b');document.dispatchEvent(new Event('yt-navigate-finish'));});expect((root.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Unfinished B');
 await act(async()=>{module!.contentRoot.unmount();});
 // Recreate the app against the same mock storage, analogous to reloading its content script.
 const {createRoot}=await import('react-dom/client');const React=await import('react');
 const mount=document.createElement('div');root.append(mount);const remounted=createRoot(mount);
 await act(async()=>{remounted.render(React.createElement(module!.App));});
 await act(async()=>{(root.querySelector('.notes-button') as HTMLButtonElement).click();});
 expect((root.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Unfinished B');
 await act(async()=>{history.pushState({},'','/watch?v=a');document.dispatchEvent(new Event('yt-navigate-finish'));});
 expect(root.querySelector('.note')!.textContent).toContain('Draft A');
 const {Repository}=await import('../src/storage');const restored=await new Repository().read();expect(restored.notes).toHaveLength(1);expect(restored.notes[0].seconds).toBe(12);
 await act(async()=>{remounted.unmount();});vi.useRealTimers();vi.unstubAllGlobals();
});
