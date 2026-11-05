import type {VideoRecord} from './model';
export interface DraftCapture {video:VideoRecord; timestampSeconds:number|null}
export function captureDraft(text:string,previous:DraftCapture|undefined,video:VideoRecord,element:HTMLVideoElement):DraftCapture|undefined{
 if(text.length===0)return undefined;
 if(previous||!text.trim())return previous;
 return {video,timestampSeconds:element.readyState>=1&&Number.isFinite(element.currentTime)&&element.currentTime>=0?element.currentTime:null};
}
/** Window capture runs before document/player handlers; native text/IME defaults remain intact. */
export function isolateEditingKeys(root:ShadowRoot){
 const stop=(event:KeyboardEvent)=>{
  if(event.key==='Tab')return; // Keep native focus navigation and the reflection focus trap.
  const editable=event.composedPath().some(node=>node instanceof HTMLElement&&root.contains(node)&&
   (node.matches('input,textarea')||node.isContentEditable||node.getAttribute('contenteditable')==='true'));
  if(editable)event.stopImmediatePropagation();
 };
 for(const name of ['keydown','keypress','keyup'])window.addEventListener(name,stop as EventListener,true);
 return()=>{for(const name of ['keydown','keypress','keyup'])window.removeEventListener(name,stop as EventListener,true);};
}
