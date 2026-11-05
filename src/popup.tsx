import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Repository} from './storage';
import type {Database} from './model';
const repo=new Repository();
function Popup(){const [db,setDb]=useState<Database|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);useEffect(()=>{repo.read().then(setDb).catch(()=>setError('기록을 읽지 못했습니다.'));},[]);
 const change=async(key:'enabled'|'reflectionEnabled'|'diagnostics',value:boolean)=>{if(!db)return;setBusy(true);try{const settings={...db.settings,[key]:value};await repo.settings(settings);setDb({...db,settings});setError('');}catch{setError('설정을 저장하지 못했습니다.');}finally{setBusy(false);}};
 return <main style={{width:300,padding:22,fontFamily:'system-ui',color:'#244a38'}}><h1>PAUSE</h1><p>넘기기 전에, 남겨보세요.</p>{db&&<><p><label><input type="checkbox" disabled={busy} checked={db.settings.enabled} onChange={e=>change('enabled',e.target.checked)}/> PAUSE 사용</label></p><p><label><input type="checkbox" disabled={busy} checked={db.settings.reflectionEnabled} onChange={e=>change('reflectionEnabled',e.target.checked)}/> 영상 종료 후 성찰</label></p><p><label><input type="checkbox" disabled={busy} checked={!!db.settings.diagnostics} onChange={e=>change('diagnostics',e.target.checked)}/> 개발용 진단 로그 (기본 꺼짐)</label></p><p>메모 {db.notes.length}개 · 성찰 {db.reflections.length}개</p><small>기록은 chrome.storage.local에만 저장됩니다. 확장 프로그램 삭제 시 기록도 삭제됩니다.</small></>}{error&&<p role="alert">{error}</p>}</main>;
}createRoot(document.getElementById('root')!).render(<Popup/>);
