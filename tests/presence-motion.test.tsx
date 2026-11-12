// @vitest-environment jsdom
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {act,createElement} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {NotesReveal} from '../src/notes-reveal';

type Call={el:Element;frames:Keyframe[];options:KeyframeAnimationOptions;cancel:ReturnType<typeof vi.fn>};
let calls:Call[]=[];let original:typeof HTMLElement.prototype.animate;let root:Root;let host:HTMLElement;
const reveal=()=>host.shadowRoot!.querySelector<HTMLElement>('.notes-reveal')!;
function setup(fullscreen:boolean){host=document.createElement('div');if(fullscreen)host.setAttribute('data-fullscreen','');document.body.append(host);const mount=document.createElement('div');host.attachShadow({mode:'open'}).append(mount);root=createRoot(mount);}
const panel=()=>createElement('section',{className:'panel'},createElement('textarea'));
const reflection=()=>createElement('div',{className:'backdrop'},createElement('section',{className:'dialog'},createElement('textarea')));
const render=async(open:boolean,mode:'floating'|'reflection',onExited?:()=>void)=>{await act(async()=>{root.render(createElement(NotesReveal,{open,mode,onExited,children:mode==='floating'?panel():reflection()}));});};
const last=(match:(el:Element)=>boolean)=>calls.filter(c=>match(c.el)).at(-1)!;

beforeEach(()=>{(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();calls=[];original=HTMLElement.prototype.animate;
 HTMLElement.prototype.animate=function(this:Element,frames:Keyframe[],options:KeyframeAnimationOptions){const cancel=vi.fn();calls.push({el:this,frames,options,cancel});return {finished:new Promise(()=>{}),cancel} as unknown as Animation;} as typeof original;});
afterEach(async()=>{await act(async()=>{root.unmount();});if(original)HTMLElement.prototype.animate=original;else delete (HTMLElement.prototype as any).animate;vi.unstubAllGlobals();vi.useRealTimers();host.remove();});

it('slides fullscreen Notes in from the right with a fade and back out to the right',async()=>{
 setup(true);const exited=vi.fn();await render(false,'floating',exited);await render(true,'floating',exited);
 const enter=last(el=>el===reveal());expect(enter.options.duration).toBe(380);expect(enter.frames[0].opacity).toBe(0);expect(String(enter.frames[0].transform)).toMatch(/^translateX\(\d+px\)$/);expect(enter.frames[1]).toMatchObject({opacity:1,transform:'none'});
 await act(async()=>{vi.advanceTimersByTime(420);});expect(reveal().style.transform).toBe('');
 await render(false,'floating',exited);const leave=last(el=>el===reveal());expect(leave.options.duration).toBe(280);expect(leave.frames[1].opacity).toBe(0);expect(String(leave.frames[1].transform)).toMatch(/^translateX\(\d+px\)$/);
 expect(host.shadowRoot!.querySelector('textarea')).not.toBeNull();await act(async()=>{vi.advanceTimersByTime(320);});expect(host.shadowRoot!.querySelector('textarea')).toBeNull();expect(exited).toHaveBeenCalledTimes(1);
});

it('cancels a running slide on rapid reopen and keeps a single panel',async()=>{
 setup(true);await render(false,'floating');await render(true,'floating');await act(async()=>{vi.advanceTimersByTime(100);});const opening=last(el=>el===reveal());
 await render(false,'floating');expect(opening.cancel).toHaveBeenCalled();await act(async()=>{vi.advanceTimersByTime(80);});const closing=last(el=>el===reveal());
 await render(true,'floating');expect(closing.cancel).toHaveBeenCalled();expect(last(el=>el===reveal()).frames[1]).toMatchObject({opacity:1,transform:'none'});expect(host.shadowRoot!.querySelectorAll('textarea')).toHaveLength(1);
});

it('keeps regular floating Notes as a fade without movement',async()=>{
 setup(false);await render(false,'floating');await render(true,'floating');const enter=last(el=>el===reveal());expect(enter.options.duration).toBe(300);expect(enter.frames.every(f=>!('transform' in f))).toBe(true);
});

it('raises the reflection card over a dimmed blurred backdrop without fading an ancestor',async()=>{
 setup(false);const exited=vi.fn();await render(false,'reflection',exited);await render(true,'reflection',exited);
 expect(calls.some(c=>c.el===reveal())).toBe(false);expect(reveal().style.opacity).toBe('1');
 const scrim=last(el=>(el as HTMLElement).classList.contains('backdrop'));expect(scrim.frames[0]).toMatchObject({backdropFilter:'blur(0px)',backgroundColor:'rgba(0, 0, 0, 0)'});expect(scrim.frames[1]).toMatchObject({backdropFilter:'blur(12px)',backgroundColor:'rgba(0, 0, 0, 0.32)'});
 const card=last(el=>(el as HTMLElement).classList.contains('dialog'));expect(card.options.duration).toBe(420);expect(card.frames[0]).toMatchObject({opacity:'0',transform:'translateY(36px)'});expect(card.frames[1]).toMatchObject({opacity:'1',transform:'none'});
 await act(async()=>{vi.advanceTimersByTime(460);});const dialog=host.shadowRoot!.querySelector<HTMLElement>('.dialog')!;expect(dialog.style.opacity).toBe('');expect(dialog.style.transform).toBe('');
 await render(false,'reflection',exited);const down=last(el=>(el as HTMLElement).classList.contains('dialog'));expect(down.options.duration).toBe(280);expect(down.frames[1]).toMatchObject({opacity:'0',transform:'translateY(36px)'});
 expect(last(el=>(el as HTMLElement).classList.contains('backdrop')).frames[1]).toMatchObject({backdropFilter:'blur(0px)'});
 await act(async()=>{vi.advanceTimersByTime(320);});expect(exited).toHaveBeenCalledTimes(1);expect(host.shadowRoot!.querySelector('.dialog')).toBeNull();
});

it('keeps reduced motion for reflection: short fade, no movement',async()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));setup(true);await render(false,'reflection');await render(true,'reflection');
 const card=last(el=>(el as HTMLElement).classList.contains('dialog'));expect(card.options.duration).toBe(120);expect(card.frames.every(f=>f.transform==='none')).toBe(true);
});

it('keeps reduced motion for fullscreen Notes: short fade, no slide',async()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true}));setup(true);await render(false,'floating');await render(true,'floating');
 const enter=last(el=>el===reveal());expect(enter.options.duration).toBe(120);expect(enter.frames.every(f=>!('transform' in f))).toBe(true);
});
