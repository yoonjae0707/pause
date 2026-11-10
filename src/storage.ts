import { emptyDatabase, exclusionLabels, type ExclusionCategory, type Database } from './model';
// Separate keys prevent unrelated popup/settings and note writes overwriting each other.
const PREFIX='pause:v1:';
export interface Store { get(keys:null):Promise<Record<string,unknown>>; set(items:Record<string,unknown>):Promise<void> }
export class Repository {
 constructor(private store:Store=chrome.storage.local){}
 async read():Promise<Database>{
  const rows=await this.store.get(null); const db=emptyDatabase();
  for(const [key,value] of Object.entries(rows)){
   if(!key.startsWith(PREFIX))continue;
   const [kind,id]=key.slice(PREFIX.length).split(':');
   if(kind==='video')db.videos[id]=value as Database['videos'][string];
   if(kind==='note')db.notes.push(value as Database['notes'][number]);
   if(kind==='reflection')db.reflections.push(value as Database['reflections'][number]);
   if(kind==='shorts')db.shortsSessions.push(value as Database['shortsSessions'][number]);
   if(kind==='draft')db.drafts[id]=value as string;
   if(kind==='draftCapture'&&value)db.draftCaptures[id]=value as Database['draftCaptures'][string];
   if(kind==='exclusion'&&typeof value==='string'&&Object.hasOwn(exclusionLabels,value))db.reflectionExclusions[id]=value as ExclusionCategory;
   if(kind==='settings')Object.assign(db.settings,value);
  }
  return db;
 }
 async put(kind:'video'|'note'|'reflection'|'shorts'|'draft',id:string,value:unknown){await this.store.set({[`${PREFIX}${kind}:${id}`]:value});}
 async writeDraft(id:string,text:string,capture:Database['draftCaptures'][string]){await this.store.set({[`${PREFIX}draft:${id}`]:text,[`${PREFIX}draftCapture:${id}`]:capture??null});}
 async saveNote(video:Database['videos'][string],note:Database['notes'][number]){
  // One storage operation: a failed draft clear must not leave a saved note to duplicate on retry.
  await this.store.set({[`${PREFIX}video:${video.id}`]:video,[`${PREFIX}note:${note.id}`]:note,[`${PREFIX}draft:${video.id}`]:'',[`${PREFIX}draftCapture:${video.id}`]:null});
 }
 async excludeReflection(id:string,category:ExclusionCategory|null){await this.store.set({[`${PREFIX}exclusion:${id}`]:category});}
 async settings(value:Database['settings']){await this.store.set({[`${PREFIX}settings`]:value});}
}
