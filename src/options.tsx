import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Repository} from './storage';
import {exclusionLabels,exclusionReasons,type ExclusionCategory,type Database} from './model';
import {materialPopupCSS} from './material-theme';
const repo=new Repository();
export function Options(){
 const [db,setDb]=useState<Database|null>(null);const [selected,setSelected]=useState(new URLSearchParams(location.search).get('videoId')??'');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{const read=()=>{repo.read().then(setDb).catch(()=>setError('설정을 읽지 못했습니다.'));};read();chrome.storage.onChanged.addListener(read);return()=>chrome.storage.onChanged.removeListener(read);},[]);
 const change=async(category:ExclusionCategory,checked:boolean)=>{if(!db||!selected)return;setBusy(true);const reasons=exclusionReasons(db.reflectionExclusions[selected]);const next=checked?[...new Set([...reasons,category])]:reasons.filter(r=>r!==category);
  try{await repo.excludeReflection(selected,next.length?next:null);setDb(await repo.read());setError('');}catch{setError('설정을 저장하지 못했습니다. 다시 시도해주세요.');}finally{setBusy(false);}};
 const ids=db?[...new Set([selected,...Object.keys(db.videos),...Object.keys(db.reflectionExclusions)])].filter(Boolean):[];
 return <main><style>{materialPopupCSS+`main{width:min(680px,100%);margin:32px auto}fieldset{border:0;padding:0;margin:24px 0}legend{font-size:20px;margin-bottom:12px}select{font:inherit;max-width:100%;padding:12px;border:0;border-radius:12px;background:var(--bg);color:var(--fg)}label{margin:16px 0}button{font:inherit;border:0;border-radius:999px;padding:12px;background:#d3e3fd;color:#062e6f}`}</style><h1>PAUSE 설정</h1><h2>종료 성찰 제외</h2><p>음악·ASMR·광고·인강 등 기록이 필요 없는 영상은 제외 사유를 체크하세요. Notes는 계속 사용할 수 있습니다.</p><small>자동 분류가 아닌 영상별 설정입니다. 중간 광고를 자동 감지하지 않습니다. 사유를 모두 해제하면 종료 성찰을 다시 사용합니다.</small>
 {db&&<><label htmlFor="settings-video">설정할 영상</label>{ids.length?<select id="settings-video" disabled={busy} value={selected} onChange={e=>setSelected(e.target.value)}><option value="">영상을 선택하세요</option>{ids.map(id=><option key={id} value={id}>{db.videos[id]?.title??id}</option>)}</select>:<p>YouTube watch 탭에서 PAUSE popup의 ‘설정 열기’를 눌러 현재 영상을 선택하세요.</p>}
 <fieldset disabled={busy||!selected}><legend>종료 성찰을 생략할 이유</legend>{(Object.keys(exclusionLabels) as ExclusionCategory[]).map(category=><label key={category}><input type="checkbox" checked={!!selected&&exclusionReasons(db.reflectionExclusions[selected]).includes(category)} onChange={e=>void change(category,e.target.checked)}/>{exclusionLabels[category]}</label>)}</fieldset><small>제외 설정은 기기에 저장됩니다. 이미 종료 처리한 영상은 새로고침 후 다시 시청해 확인하세요.</small></>}{error&&<p role="alert">{error}</p>}</main>;
}
export const optionsRoot=createRoot(document.getElementById('root')!);optionsRoot.render(<Options/>);
