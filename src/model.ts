export interface VideoRecord { id:string; title:string; url:string; duration:number; updatedAt:number }
export interface TimestampNote { id:string; videoId:string; text:string; seconds:number; createdAt:number }
export interface Reflection { id:string; videoId:string; text:string; createdAt:number }
export interface ShortsSession { id:string; videoIds:string[]; reflectionIds:string[]; startedAt:number; endedAt?:number }
export interface UserSettings { enabled:boolean; reflectionEnabled:boolean }
export interface Database { version:1; videos:Record<string,VideoRecord>; notes:TimestampNote[]; reflections:Reflection[]; shortsSessions:ShortsSession[]; settings:UserSettings; drafts:Record<string,string> }
export const emptyDatabase=():Database=>({version:1,videos:{},notes:[],reflections:[],shortsSessions:[],settings:{enabled:true,reflectionEnabled:true},drafts:{}});
