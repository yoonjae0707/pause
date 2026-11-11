import type {DraftCapture} from './notes-input';
export const exclusionLabels={music:'음악',asmr:'ASMR',advertisement:'광고',lecture:'인강'} as const;
export type ExclusionCategory=keyof typeof exclusionLabels;
export interface VideoRecord { id:string; title:string; url:string; duration:number; updatedAt:number }
export interface TimestampNote { id:string; videoId:string; text:string; seconds:number; timestampSeconds?:number; createdAt:number }
export interface Reflection { id:string; videoId:string; text:string; createdAt:number }
export interface ShortsSession { id:string; videoIds:string[]; reflectionIds:string[]; startedAt:number; endedAt?:number }
export interface UserSettings { enabled:boolean; reflectionEnabled:boolean; diagnostics?:boolean }
export interface Database { version:1; videos:Record<string,VideoRecord>; notes:TimestampNote[]; reflections:Reflection[]; shortsSessions:ShortsSession[]; settings:UserSettings; drafts:Record<string,string>; draftCaptures:Record<string,DraftCapture|undefined>; reflectionExclusions:Record<string,ExclusionCategory|ExclusionCategory[]> }
export const emptyDatabase=():Database=>({version:1,videos:{},notes:[],reflections:[],shortsSessions:[],settings:{enabled:true,reflectionEnabled:true,diagnostics:false},drafts:{},draftCaptures:{},reflectionExclusions:{}});

export function exclusionReasons(value:ExclusionCategory|ExclusionCategory[]|undefined):ExclusionCategory[]{return value?(Array.isArray(value)?value:[value]):[];}
