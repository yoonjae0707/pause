// @vitest-environment jsdom
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {act,createElement} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {NotesReveal} from '../src/notes-reveal';
import {CASCADE,cascadeTargets} from '../src/list-cascade';

type Call={el:Element;frames:Keyframe[];options:KeyframeAnimationOptions;cancel:ReturnType<typeof vi.fn>};
let calls:Call[]=[];let original:typeof HTMLElement.prototype.animate;let root:Root;let page:HTMLElement;let items:HTMLElement[];let reveal:()=>HTMLElement;
const NOTES=400,CARD=100;
// Layout model: each card sits below the docked Notes host, whose height is the reveal node's inline height.
const notesHeight=()=>{const h=reveal()?.style.height;return h==='auto'?NOTES:parseFloat(h||'0')||0;};

function buildPage(withItems=true){
 page=document.createElement('div');page.id='secondary-inner';document.body.append(page);
 document.head.querySelector('#cascade-css')?.remove();const css=document.createElement('style');css.id='cascade-css';css.textContent='ytd-compact-video-renderer,yt-lockup-view-model,yt-related-chip-cloud-renderer,ytd-watch-next-secondary-results-renderer,ytd-item-section-renderer{display:block}';document.head.append(css);
 const host=document.createElement('div');page.append(host);const shadow=host.attachShadow({mode:'open'});const mount=document.createElement('div');shadow.append(mount);
 const results=document.createElement('ytd-watch-next-secondary-results-renderer');page.append(results);
 items=[];
 if(withItems){
  const chips=document.createElement('yt-related-chip-cloud-renderer');chips.append(document.createElement('yt-chip-cloud-renderer'));results.append(chips);items.push(chips);
  const section=document.createElement('ytd-item-section-renderer');results.append(section);
  for(let i=0;i<5;i++){const card=document.createElement(i%2?'yt-lockup-view-model':'ytd-compact-video-renderer');if(i===0)card.append(document.createElement('yt-lockup-view-model'));section.append(card);items.push(card);}
 }else{const block=document.createElement('div');block.className='unknown-layout';results.append(block);}
 reveal=()=>shadow.querySelector<HTMLElement>('.notes-reveal')!;
 root=createRoot(mount);
}
const render=async(open:boolean,mode:'sidebar'|'floating'='sidebar',onExited?:()=>void)=>{await act(async()=>{root.render(createElement(NotesReveal,{open,mode,onExited,children:createElement('textarea',{defaultValue:'draft'})}));});};
const itemCalls=()=>calls.filter(c=>items.includes(c.el as HTMLElement));
const translate=(f:Keyframe)=>parseFloat(String(f.transform).replace('translateY(',''));

beforeEach(()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();calls=[];
 vi.spyOn(Element.prototype,'scrollHeight','get').mockReturnValue(NOTES);
 vi.spyOn(Element.prototype,'getBoundingClientRect').mockImplementation(function(this:Element){
  if(this===reveal?.()){const h=notesHeight();return {top:0,height:h,width:300,left:0,right:300,bottom:h,x:0,y:0,toJSON(){}} as DOMRect;}
  const i=items.indexOf(this as HTMLElement);if(i<0)return {top:0,height:0,width:0,left:0,right:0,bottom:0,x:0,y:0,toJSON(){}} as DOMRect;
  const top=notesHeight()+i*CARD;return {top,height:CARD-8,width:300,left:0,right:300,bottom:top+CARD-8,x:0,y:top,toJSON(){}} as DOMRect;
 });
 original=HTMLElement.prototype.animate;
 HTMLElement.prototype.animate=function(this:Element,frames:Keyframe[],options:KeyframeAnimationOptions){const cancel=vi.fn();calls.push({el:this,frames,options,cancel});return {finished:new Promise(()=>{}),cancel} as unknown as Animation;} as typeof original;
});
afterEach(async()=>{await act(async()=>{root.unmount();});if(original)HTMLElement.prototype.animate=original;else delete (HTMLElement.prototype as any).animate;vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();page.remove();});

it('finds outermost recommendation entries after the docked host and nothing without them',()=>{
 buildPage();vi.useRealTimers();
 const node=document.createElement('div');(page.firstElementChild!.shadowRoot!).append(node);
 expect(cascadeTargets(node)).toEqual(items);
 expect(cascadeTargets(document.createElement('div'))).toEqual([]);
 page.remove();buildPage(false);const other=document.createElement('div');(page.firstElementChild!.shadowRoot!).append(other);expect(cascadeTargets(other)).toEqual([]);
});

it('opens bottom-first with real coordinate deltas, a small bounce and no inline styles on YouTube cards',async()=>{
 buildPage();await render(false);await render(true);
 const moves=itemCalls();expect(moves).toHaveLength(items.length);
 expect(moves.map(c=>c.el)).toEqual([...items].reverse());
 expect(moves.map(c=>c.options.delay)).toEqual(items.map((_,i)=>i*CASCADE.stagger));
 for(const c of moves){expect(c.options.duration).toBe(450);expect(c.options.fill).toBe('backwards');expect(translate(c.frames[0])).toBe(-NOTES);expect(translate(c.frames[1])).toBe(4);expect(c.frames.at(-1)!.transform).toBe('translateY(0px)');}
 const fade=calls.find(c=>c.el===reveal())!;expect(fade.frames.every(f=>!('height' in f))).toBe(true);expect(fade.frames.at(-1)!.opacity).toBe(1);expect(reveal().style.height).toBe('auto');
 for(const el of items)expect(el.getAttribute('style')).toBeNull();
});

it('closes bottom-first, keeps the fading card painted while the list rises and cleans up on exit',async()=>{
 buildPage();const exited=vi.fn();await render(false,'sidebar',exited);await render(true,'sidebar',exited);await act(async()=>{vi.advanceTimersByTime(900);});calls=[];
 await render(false,'sidebar',exited);
 const moves=itemCalls();expect(moves.map(c=>c.el)).toEqual([...items].reverse());
 expect(moves.map(c=>c.options.delay)).toEqual(items.map((_,i)=>i*CASCADE.stagger));
 for(const c of moves){expect(translate(c.frames[0])).toBe(NOTES);expect(translate(c.frames[1])).toBe(-4);}
 expect(reveal().style.height).toBe('0px');expect(reveal().style.overflow).toBe('visible');expect(reveal().querySelector('textarea')).not.toBeNull();
 await act(async()=>{vi.advanceTimersByTime(420);});
 expect(exited).toHaveBeenCalledTimes(1);expect(reveal().querySelector('textarea')).toBeNull();expect(reveal().style.overflow).toBe('');
 for(const el of items)expect(el.getAttribute('style')).toBeNull();
});

it('moves the block children of inline custom elements, where transform would have no effect',()=>{
 buildPage();vi.useRealTimers();const section=page.querySelector('ytd-item-section-renderer')!;
 const inline=document.createElement('yt-lockup-view-model');inline.style.display='inline';const inner=document.createElement('div');inner.className='yt-lockup-view-model';inline.append(inner);section.append(inline);
 const node=document.createElement('div');page.querySelector('div')!.shadowRoot!.append(node);
 const targets=cascadeTargets(node);expect(targets).toContain(inner);expect(targets).not.toContain(inline);
});

it('rapid reopen cancels the running wave and restarts from the current positions',async()=>{
 buildPage();await render(false);await render(true);const opening=itemCalls();await act(async()=>{vi.advanceTimersByTime(100);});
 calls=[];await render(false);expect(opening.every(c=>c.cancel.mock.calls.length===1)).toBe(true);const closing=itemCalls();expect(closing).toHaveLength(items.length);
 await act(async()=>{vi.advanceTimersByTime(60);});calls=[];await render(true);
 expect(closing.every(c=>c.cancel.mock.calls.length===1)).toBe(true);expect(itemCalls().map(c=>translate(c.frames[0]))).toEqual(items.map(()=>-NOTES));
 expect(reveal().querySelectorAll('textarea')).toHaveLength(1);expect(reveal().style.overflow).toBe('');
});

it('stops the wave on resize, SPA navigation and unmount',async()=>{
 buildPage();await render(false);await render(true);let moves=itemCalls();expect(moves).toHaveLength(items.length);
 window.dispatchEvent(new Event('resize'));expect(moves.every(c=>c.cancel.mock.calls.length===1)).toBe(true);
 await act(async()=>{vi.advanceTimersByTime(900);});calls=[];await render(false);moves=itemCalls();expect(moves).toHaveLength(items.length);
 document.dispatchEvent(new Event('yt-navigate-start'));expect(moves.every(c=>c.cancel.mock.calls.length===1)).toBe(true);
 await act(async()=>{vi.advanceTimersByTime(500);});calls=[];await render(true);moves=itemCalls();expect(moves).toHaveLength(items.length);
 await act(async()=>{root.unmount();});expect(moves.every(c=>c.cancel.mock.calls.length>=1)).toBe(true);root=createRoot(document.createElement('div'));
});

it('falls back to the height spring when recommendation cards are not found',async()=>{
 buildPage(false);await render(false);await render(true);
 const fade=calls.find(c=>c.el===reveal())!;const heights=fade.frames.map(f=>parseFloat(String(f.height)));
 expect(Math.max(...heights)).toBeGreaterThan(heights.at(-1)!);expect(calls.filter(c=>c.el!==reveal())).toHaveLength(0);
});

it('keeps reduced motion as an opacity-only fade with no card movement',async()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));buildPage();await render(false);await render(true);
 expect(itemCalls()).toHaveLength(0);const fade=calls.find(c=>c.el===reveal())!;expect(fade.options.duration).toBe(120);expect(fade.frames[0]).not.toHaveProperty('height');
 calls=[];await render(false);expect(itemCalls()).toHaveLength(0);
});

it('does not touch the list from floating Notes',async()=>{
 buildPage();await render(false,'floating');await render(true,'floating');expect(itemCalls()).toHaveLength(0);
});
