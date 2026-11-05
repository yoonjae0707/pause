// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {captureDraft,isolateEditingKeys} from '../src/notes-input';
const record={id:'a',title:'Original',url:'https://www.youtube.com/watch?v=a',duration:600,updatedAt:1};
it('captures the first nonwhitespace input, preserves it through seek and whitespace, resets only on empty',()=>{
 const v=document.createElement('video');Object.defineProperty(v,'readyState',{value:1});v.currentTime=180;
 expect(captureDraft('  ',undefined,record,v)).toBeUndefined();v.currentTime=204;
 const first=captureDraft('안',undefined,record,v)!;expect(first.timestampSeconds).toBe(204);v.currentTime=252;
 expect(captureDraft('안녕하세요 123 456',first,{...record,title:'Changed'},v)).toBe(first);
 expect(captureDraft(' ',first,record,v)).toBe(first);expect(captureDraft('',first,record,v)).toBeUndefined();expect(captureDraft('new',undefined,record,v)!.timestampSeconds).toBe(252);
});
it('does not invent a timestamp for unprepared video or replace an unknown capture on later edits',()=>{const v=document.createElement('video');const first=captureDraft('text',undefined,record,v)!;expect(first.timestampSeconds).toBeNull();Object.defineProperty(v,'readyState',{value:1});v.currentTime=204;expect(captureDraft('text2',first,record,v)!.timestampSeconds).toBeNull();});
it('isolates composed editable keys before document capture without canceling text/IME defaults; cleans up',()=>{
 const host=document.createElement('div');document.body.append(host);const shadow=host.attachShadow({mode:'open'});shadow.innerHTML='<textarea></textarea><input><div contenteditable="true"></div><button>Other</button>';
 const youtube=vi.fn();document.addEventListener('keydown',youtube,true);document.addEventListener('keyup',youtube);document.addEventListener('keypress',youtube);
 const cleanup=isolateEditingKeys(shadow);
 for(const target of shadow.querySelectorAll('textarea,input,[contenteditable]'))for(const type of ['keydown','keyup','keypress'])for(const key of [' ','0','1','2','3','4','5','6','7','8','9','Backspace','Enter','ArrowLeft','ArrowRight','Escape','a','c','v','Process']){
  const event=new KeyboardEvent(type,{key,bubbles:true,composed:true,cancelable:true,ctrlKey:['a','c','v'].includes(key),isComposing:key==='Process'});target.dispatchEvent(event);expect(event.defaultPrevented).toBe(false);
 }
 expect(youtube).not.toHaveBeenCalled();shadow.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true,composed:true}));expect(youtube).toHaveBeenCalledTimes(1);
 cleanup();const cleanupAgain=isolateEditingKeys(shadow);cleanupAgain();shadow.querySelector('textarea')!.dispatchEvent(new KeyboardEvent('keydown',{key:'1',bubbles:true,composed:true}));expect(youtube).toHaveBeenCalledTimes(2);
 document.removeEventListener('keydown',youtube,true);document.removeEventListener('keyup',youtube);document.removeEventListener('keypress',youtube);host.remove();
});
