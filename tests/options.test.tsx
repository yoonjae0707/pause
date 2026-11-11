// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act} from 'react';
import {openSettings} from '../src/open-settings';
it('opens extension settings using only content-script context, without reading tab URLs',async()=>{const create=vi.fn();vi.stubGlobal('chrome',{tabs:{query:async()=>[{id:7}],sendMessage:async()=>({videoId:'a'}),create},runtime:{getURL:(p:string)=>'chrome-extension://pause/'+p}});await openSettings();expect(create).toHaveBeenCalledWith({url:'chrome-extension://pause/options.html?videoId=a'});vi.unstubAllGlobals();});
it('supports multiple exclusion checkboxes, migrates a legacy reason, and clears the last reason',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;const rows:Record<string,unknown>={'pause:v1:exclusion:a':'music'};const listeners=new Set<()=>void>();vi.stubGlobal('chrome',{storage:{local:{get:async()=>structuredClone(rows),set:async(data:Record<string,unknown>)=>{Object.assign(rows,data);listeners.forEach(f=>f());}},onChanged:{addListener:(f:()=>void)=>listeners.add(f),removeListener:(f:()=>void)=>listeners.delete(f)}}});history.replaceState({},'','/options.html?videoId=a');document.body.innerHTML='<div id="root"></div>';
 let mod:typeof import('../src/options');await act(async()=>{mod=await import('../src/options');});const boxes=()=>Array.from(document.querySelectorAll<HTMLInputElement>('fieldset input'));
 expect(boxes()).toHaveLength(4);expect(boxes()[0].checked).toBe(true);
 await act(async()=>{boxes()[1].click();});expect(rows['pause:v1:exclusion:a']).toEqual(['music','asmr']);
 await act(async()=>{boxes()[0].click();});expect(rows['pause:v1:exclusion:a']).toEqual(['asmr']);await act(async()=>{boxes()[1].click();});expect(rows['pause:v1:exclusion:a']).toBeNull();
 await act(async()=>{mod!.optionsRoot.unmount();});vi.unstubAllGlobals();
});
