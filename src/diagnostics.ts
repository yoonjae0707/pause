let enabled=false;
export function configureDiagnostics(value:boolean){enabled=value;}
// Only explicit technical fields. Never pass DOM objects, titles, notes, URLs or credentials.
export function diagnostic(event:string,fields:{videoId?:string;duration?:number;watched?:number;ratio?:number;position?:number;reason?:string;adHint?:boolean;ended?:boolean}={}){
 if(enabled)console.info('[PAUSE diagnostic]',JSON.stringify({event,...fields}));
}
