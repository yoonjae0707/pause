// Browser navigation is an external effect, replaced only in DOM regression tests.
export function navigateTo(url:string){location.assign(url);}
