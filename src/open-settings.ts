export async function openSettings(){
 let videoId:string|undefined;
 try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(tab?.id){const response=await chrome.tabs.sendMessage(tab.id,{type:'pause-context'});videoId=response?.videoId;}}catch{/* Other pages have no PAUSE content script. */}
 await chrome.tabs.create({url:chrome.runtime.getURL('options.html')+(videoId?'?videoId='+encodeURIComponent(videoId):'')});
}
