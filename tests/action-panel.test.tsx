// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act} from 'react';
it('shares one Notes panel between action entry and FAB across layout changes',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();vi.stubGlobal('innerWidth',1200);
 const rows:Record<string,unknown>={};vi.stubGlobal('chrome',{storage:{local:{get:async()=>structuredClone(rows),set:async(data:Record<string,unknown>)=>{Object.assign(rows,data);}},onChanged:{addListener:()=>{},removeListener:()=>{}}}});
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockReturnValue({x:0,y:0,left:0,top:0,right:200,bottom:36,width:200,height:36,toJSON(){}});
 history.replaceState({},'','/watch?v=a');document.body.innerHTML='<video></video><ytd-watch-metadata><div id="actions"><div id="top-level-buttons-computed"></div></div></ytd-watch-metadata>';
 let content:typeof import('../src/content');await act(async()=>{content=await import('../src/content');});await act(async()=>{vi.advanceTimersByTime(32);});
 const root=document.getElementById('pause-extension')!.shadowRoot!;const action=()=>document.querySelector('[data-pause-action]')!.shadowRoot!.querySelector('button')!;
 expect((root.querySelector('.notes-button') as HTMLButtonElement).hidden).toBe(true);await act(async()=>{action().click();});expect(root.querySelectorAll('textarea')).toHaveLength(1);expect(root.querySelector('.notes-floating-enter')).not.toBeNull();expect(action().getAttribute('aria-expanded')).toBe('true');
 const textarea=root.querySelector('textarea')!;const key=Object.keys(textarea).find(k=>k.startsWith('__reactProps'))!;await act(async()=>{(textarea as any)[key].onChange({target:{value:'draft'}});});
 await act(async()=>{vi.stubGlobal('innerWidth',500);window.dispatchEvent(new Event('resize'));vi.advanceTimersByTime(32);});
 expect((root.querySelector('.notes-button') as HTMLButtonElement).hidden).toBe(false);expect(root.querySelectorAll('textarea')).toHaveLength(1);expect((root.querySelector('textarea') as HTMLTextAreaElement).value).toBe('draft');
 await act(async()=>{(root.querySelector('.notes-button') as HTMLButtonElement).click();});expect(root.querySelector('textarea')).toBeNull();
 await act(async()=>{(root.querySelector('.notes-button') as HTMLButtonElement).click();document.documentElement.setAttribute('dark','');});expect(document.getElementById('pause-extension')!.hasAttribute('data-dark')).toBe(true);expect(root.querySelectorAll('textarea')).toHaveLength(1);
 await act(async()=>{content!.contentRoot.unmount();});expect(document.querySelector('[data-pause-action]')).toBeNull();vi.restoreAllMocks();vi.useRealTimers();vi.unstubAllGlobals();
});
