import {FullscreenUI} from './fullscreen-ui';
import {NotesReveal} from './notes-reveal';
import {createPortal} from 'react-dom';
import {SidebarEntry} from './sidebar-entry';
import {NotesHeader} from './notes-header';
import {ActionEntry} from './action-entry';
import {captureDraft,isolateEditingKeys,type DraftCapture} from './notes-input';
import {configureDiagnostics,diagnostic} from './diagnostics';
import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Controller,type PlaybackContext} from './controller';
import {PlaybackHold} from './playback-hold';
import {navigateTo} from './navigation';
import {Repository} from './storage';
import {exclusionReasons,type Database,type VideoRecord} from './model';
import {materialSurfaceCSS} from './material-theme';
const repo=new Repository();
const host=document.createElement('div');host.id='pause-extension';document.documentElement.append(host);
const shadow=host.attachShadow({mode:'open'});const mount=document.createElement('div');shadow.append(mount);
const style=document.createElement('style');style.textContent=`:host{all:initial;font:15px system-ui;color:#20382f}*{box-sizing:border-box}button,textarea{font:inherit}button{cursor:pointer;border:0;border-radius:10px;padding:10px 14px;background:#dcece1;color:#20382f}button:disabled{opacity:.5;cursor:default}textarea{display:block;width:100%;min-height:110px;margin:14px 0;padding:12px;border:1px solid #b2c9bc;border-radius:10px;resize:vertical}h2{margin:0 0 10px}p{line-height:1.6}.notes-button{position:fixed;right:24px;bottom:28px;z-index:2147483645;box-shadow:0 3px 20px #0003}.panel{position:fixed;right:24px;bottom:85px;width:340px;max-width:90vw;max-height:70vh;overflow:auto;background:#fafcf7;padding:22px;border-radius:18px;box-shadow:0 8px 40px #0005;z-index:2147483646}.backdrop{position:fixed;inset:0;display:grid;place-items:center;background:#10241dc9;z-index:2147483647}.dialog{background:#fafcf7;width:480px;max-width:92vw;max-height:90vh;overflow:auto;border-radius:22px;padding:30px}.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.primary{background:#295c47;color:white}.note{border-top:1px solid #d8e1da;padding:12px 0;white-space:pre-wrap;overflow-wrap:anywhere}.muted{font-size:13px;color:#52665b}`;style.textContent+=`:host{--pause-bg:#fff;--pause-fg:#242424;--pause-muted:#606060;--pause-line:#d9dedb;--pause-input:#fafafa;color:var(--pause-fg)}:host([data-dark]){--pause-bg:#212121;--pause-fg:#f1f1f1;--pause-muted:#b5bdb8;--pause-line:#505852;--pause-input:#181c19}.panel,.dialog{background:var(--pause-bg);color:var(--pause-fg);border:1px solid var(--pause-line);line-height:1.5}.panel{width:360px;padding:20px;border-radius:16px;max-height:calc(100dvh - 120px)}h2{font-size:19px;font-weight:650;letter-spacing:-.2px}.muted{color:var(--pause-muted)}textarea{background:var(--pause-input);color:var(--pause-fg);border-color:var(--pause-line);line-height:1.6;min-height:128px}textarea:focus-visible,button:focus-visible{outline:3px solid #42966d;outline-offset:3px}.note{border-color:var(--pause-line)}button:hover:not(:disabled){filter:brightness(.95)}.notes-button[hidden]{display:none}button:disabled{cursor:default}@media(max-width:480px){.panel{left:12px;right:12px;width:auto;bottom:82px;padding:16px}.notes-button{right:12px;bottom:20px}.dialog{padding:20px}}@media(forced-colors:active){button,textarea,.panel,.dialog{border:1px solid CanvasText}button:focus-visible,textarea:focus-visible{outline-color:Highlight}}`;
style.textContent+=materialSurfaceCSS;
shadow.append(style);
const dockHost=document.createElement('div');dockHost.dataset.pauseSidebar='true';const dockShadow=dockHost.attachShadow({mode:'open'});dockShadow.append(style.cloneNode(true));const dockMount=document.createElement('div');dockShadow.append(dockMount);const dockStyle=document.createElement('style');dockStyle.textContent=':host{display:block;position:relative;width:100%;z-index:1}:host::after{content:"";position:absolute;left:0;right:0;top:100%;height:60vh;background:linear-gradient(to bottom,#00000020,transparent);opacity:0;transition:opacity 240ms ease;pointer-events:none}:host([data-notes-open])::after{opacity:1}@media(prefers-reduced-motion:reduce){:host::after{transition:none}}.panel.notes-card{position:relative;inset:auto;width:100%;max-width:100%;max-height:none;overflow:visible;box-shadow:none;margin:0 0 16px}';dockShadow.append(dockStyle);
const syncTheme=()=>{for(const root of [host,dockHost])root.toggleAttribute('data-dark',document.documentElement.hasAttribute('dark'));};

export function App(){
 const [db,setDb]=useState<Database|null>(null);const [ctx,setCtx]=useState<PlaybackContext|null>(null);const [open,setOpen]=useState(false);
 const [docked,setDocked]=useState(false);const [fullscreenPlaced,setFullscreenPlaced]=useState(false);const [fullscreenActive,setFullscreenActive]=useState(false);const fullscreenUI=React.useRef<FullscreenUI|null>(null);
 const [actionPlaced,setActionPlaced]=useState(false);const entry=React.useRef<ActionEntry|null>(null);
 const [reflection,setReflection]=useState<{ctx:PlaybackContext;record:VideoRecord;started:number}|null>(null);
 const [text,setText]=useState('');const [drafts,setDrafts]=useState<Record<string,string>>({});const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [tick,setTick]=useState(Date.now());
 const pending=React.useRef<string|null>(null);const active=React.useRef(false);const settings=React.useRef<Database['settings']>({enabled:false,reflectionEnabled:false});const draftQueue=React.useRef(Promise.resolve());
 const exclusions=React.useRef<Database['reflectionExclusions']>({});
 const captures=React.useRef<Record<string,DraftCapture|undefined>>({});
 const controllerRef=React.useRef<Controller|null>(null);const hold=React.useRef<PlaybackHold|null>(null);
 useEffect(()=>{if(!ctx||!db?.settings.enabled){setActionPlaced(false);return;}try{const instance=new ActionEntry(()=>setOpen(value=>!value),setActionPlaced);entry.current=instance;instance.setExpanded(open);return()=>{instance.dispose();entry.current=null;};}catch{setActionPlaced(false);}},[!!ctx,db?.settings.enabled]);
 useEffect(()=>{entry.current?.setExpanded(open);fullscreenUI.current?.setExpanded(open);dockHost.toggleAttribute('data-notes-open',open&&docked);return()=>dockHost.removeAttribute('data-notes-open');},[open,actionPlaced,docked]);
 useEffect(()=>{if(!db?.settings.enabled){setFullscreenPlaced(false);setFullscreenActive(false);return;}const ui=new FullscreenUI(host,()=>setOpen(value=>!value),(active,placed)=>{setFullscreenActive(active);setFullscreenPlaced(placed);});fullscreenUI.current=ui;ui.setExpanded(open);return()=>{ui.dispose();fullscreenUI.current=null;};},[db?.settings.enabled]);
 useEffect(()=>{syncTheme();const observer=new MutationObserver(syncTheme);observer.observe(document.documentElement,{attributes:true,attributeFilter:['dark']});return()=>observer.disconnect();},[]);
 useEffect(()=>{const a=isolateEditingKeys(shadow),b=isolateEditingKeys(dockShadow);return()=>{a();b();};},[]);
 useEffect(()=>{if(!ctx||!db?.settings.enabled){setDocked(false);return;}try{const sidebar=new SidebarEntry(dockHost,setDocked);return()=>sidebar.dispose();}catch{setDocked(false);}},[!!ctx,db?.settings.enabled]);
 useEffect(()=>{repo.read().then(data=>{setDb(data);setDrafts(data.drafts);captures.current=data.draftCaptures;settings.current=data.settings;exclusions.current=data.reflectionExclusions;configureDiagnostics(!!data.settings.diagnostics);}).catch(()=>setError('저장소를 읽지 못했습니다. 확장 프로그램을 다시 열어주세요.'));
  const onChange=()=>{repo.read().then(data=>{setDb(data);settings.current=data.settings;exclusions.current=data.reflectionExclusions;configureDiagnostics(!!data.settings.diagnostics);}).catch(()=>{});};chrome.storage.onChanged.addListener(onChange);
  const controller=new Controller(c=>{setCtx(c);hold.current?.hold(c);},c=>{
   if(!settings.current.enabled||!settings.current.reflectionEnabled||active.current){diagnostic('intervention-rejected',{videoId:c.id,reason:active.current?'active-overlay':'settings-disabled'});return false;}
   if(exclusionReasons(exclusions.current[c.id]).length){diagnostic('intervention-excluded',{videoId:c.id,reason:exclusionReasons(exclusions.current[c.id]).join(',')});return true;}
   diagnostic('intervention-start',{videoId:c.id});
   active.current=true;controller.setSuspended(true);hold.current=new PlaybackHold(c.id);c.video.pause();pending.current=null;
   const record={id:c.id,title:c.title||document.title.replace(/ - YouTube$/,''),url:`https://www.youtube.com/watch?v=${encodeURIComponent(c.id)}`,duration:c.duration??c.video.duration,updatedAt:Date.now()};
   setText('');setReflection({ctx:c,record,started:Date.now()});return true;
  });
  controllerRef.current=controller;
  const contextMessage=(message:{type?:string},_sender:chrome.runtime.MessageSender,respond:(data:unknown)=>void)=>{if(message.type==='pause-context')respond({videoId:controller.current?.id??null});};
  chrome.runtime?.onMessage?.addListener(contextMessage);
  return()=>{chrome.runtime?.onMessage?.removeListener(contextMessage);controller.dispose();controllerRef.current=null;chrome.storage.onChanged.removeListener(onChange);};
 },[]);
 useEffect(()=>{if(!reflection)return;diagnostic('overlay-mounted',{videoId:reflection.ctx.id});
  const pauseCurrent=()=>{controllerRef.current?.sync();hold.current?.hold(controllerRef.current?.current??null);};
  const interval=setInterval(()=>{setTick(Date.now());pauseCurrent();},100);
  document.addEventListener('play',pauseCurrent,true);
  // Intercept only an explicit watch/shorts link clicked while the dialog is active.
  const click=(event:MouseEvent)=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const a=event.composedPath().find(x=>x instanceof HTMLAnchorElement) as HTMLAnchorElement|undefined;if(!a||a.target==='_blank')return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&(/^\/watch$/.test(url.pathname)||url.pathname.startsWith('/shorts/'))){event.preventDefault();event.stopImmediatePropagation();pending.current=url.href;}};
  const previous=document.activeElement as HTMLElement|null;
  const key=(event:KeyboardEvent)=>{if(event.key!=='Tab')return;const nodes=Array.from(shadow.querySelectorAll<HTMLElement>('.dialog textarea:not(:disabled),.dialog button:not(:disabled)'));if(!nodes.length)return;const index=nodes.indexOf(shadow.activeElement as HTMLElement);event.preventDefault();nodes[(index+(event.shiftKey?-1:1)+nodes.length)%nodes.length].focus();};
  shadow.addEventListener('keydown',key as EventListener);
  document.addEventListener('click',click,true);return()=>{diagnostic('overlay-unmounted',{videoId:reflection.ctx.id});clearInterval(interval);document.removeEventListener('play',pauseCurrent,true);document.removeEventListener('click',click,true);shadow.removeEventListener('keydown',key as EventListener);previous?.focus();};
 },[reflection]);
 const finish=()=>{active.current=false;setReflection(null);const url=pending.current;pending.current=null;const interrupted=hold.current;hold.current=null;controllerRef.current?.setSuspended(false);void interrupted?.release(controllerRef.current?.current??null,!!url).catch(()=>setError('다음 영상의 재생 버튼을 눌러 계속 시청해주세요.'));if(url)navigateTo(url);};
 const saveReflection=async()=>{if(!reflection||!text.trim()||busy)return;setBusy(true);try{await repo.put('video',reflection.record.id,reflection.record);const id=crypto.randomUUID();await repo.put('reflection',id,{id,videoId:reflection.record.id,text:text.trim(),createdAt:Date.now()});setError('');finish();}catch{setError('저장하지 못했습니다. 내용을 유지했으니 다시 시도해주세요.');}finally{setBusy(false);}};
 const saveNote=async()=>{if(!ctx||!drafts[ctx.id]?.trim()||busy)return;
  const capture=captures.current[ctx.id];
  if(!capture||capture.timestampSeconds===null){setError('최초 입력 시각을 확인할 수 없습니다. 내용을 복사한 뒤 영상을 준비하고 입력을 모두 비워 다시 작성해주세요.');return;}
  setBusy(true);const id=crypto.randomUUID();const videoId=capture.video.id;const original=drafts[videoId];const seconds=capture.timestampSeconds;
  try{await draftQueue.current;await repo.saveNote(capture.video,{id,videoId,text:original.trim(),seconds,timestampSeconds:seconds,createdAt:Date.now()});delete captures.current[videoId];setDrafts(d=>({...d,[videoId]:''}));setDb(await repo.read());setError('');}catch{setError('메모를 저장하지 못했습니다. 다시 시도해주세요.');}finally{setBusy(false);}};
 const updateDraft=(value:string)=>{if(!ctx)return;const id=ctx.id;
  const record={id,title:document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim()||document.title,url:`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,duration:Number.isFinite(ctx.video.duration)?ctx.video.duration:0,updatedAt:Date.now()};
  const capture=captureDraft(value,captures.current[id],record,ctx.video);captures.current[id]=capture;
  setDrafts(d=>({...d,[id]:value}));draftQueue.current=draftQueue.current.catch(()=>{}).then(()=>repo.writeDraft(id,value,capture));draftQueue.current.catch(()=>setError('초안을 저장하지 못했습니다.'));};
 const time=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
 const notesCard=ctx&&db?(<section className="panel notes-card" aria-label="영상 메모"><NotesHeader key={ctx.id} videoId={ctx.id} onClose={()=>setOpen(false)}/><div className="notes-body"><p className="muted">첫 비공백 입력 시점을 기록해요. 초안은 자동 보존됩니다.</p><textarea aria-label="메모" value={drafts[ctx.id]??''} disabled={busy} onChange={e=>updateDraft(e.target.value)}/><button className="primary" disabled={busy||!drafts[ctx.id]?.trim()} onClick={saveNote}>메모 저장</button>{db.notes.filter(n=>n.videoId===ctx.id).sort((a,b)=>a.seconds-b.seconds).map(n=><div className="note" key={n.id}><button onClick={()=>{ctx.video.currentTime=n.seconds;}}>{time(n.seconds)}</button><p>{n.text}</p></div>)}{error&&<p role="alert">{error}</p>}</div></section>):null;
 return <>{ctx&&db?.settings.enabled&&<><button hidden={fullscreenActive?fullscreenPlaced:actionPlaced||(docked&&open)} className="notes-button" onClick={()=>setOpen(!open)} aria-expanded={open}>PAUSE Notes</button>{!open&&error&&<p className="panel" role="alert">{error}</p>}{docked?createPortal(<NotesReveal open={open}>{notesCard}</NotesReveal>,dockMount):open&&notesCard}</>}
 {reflection&&<div className="backdrop"><section className="dialog reflection-card" role="dialog" aria-modal="true" aria-labelledby="pause-title"><NotesHeader key={reflection.record.id} videoId={reflection.record.id} title="PAUSE · 잠깐 돌아보기"/><div className="reflection-body"><p className="muted">넘기기 전에, 남겨보세요.</p><h2 id="pause-title">이 영상에서 무엇을 얻었나요?</h2><p>{reflection.record.title}</p><textarea autoFocus aria-label="영상 성찰" placeholder="기억하고 싶은 한 가지 생각" value={text} onChange={e=>setText(e.target.value)} disabled={busy}/><div className="row"><button className="primary" onClick={saveReflection} disabled={busy||!text.trim()}>기록하고 계속</button><button onClick={finish} disabled={busy||Math.max(tick,Date.now())-reflection.started<5000}>{Math.max(tick,Date.now())-reflection.started<5000?`${Math.ceil((5000-(Math.max(tick,Date.now())-reflection.started))/1000)}초 후 건너뛰기`:'그냥 건너뛰기'}</button></div><p className="muted">기록하지 않아도 괜찮아요. 모든 기록은 이 기기에만 저장됩니다.</p>{error&&<p role="alert">{error}</p>}</div></section></div>}</>;
}
export const contentRoot=createRoot(mount);
contentRoot.render(<App/>);
