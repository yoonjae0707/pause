/** Explicit YouTube fullscreen states only; never infer fullscreen from screen dimensions. */
export function fullscreenTarget():HTMLElement|null{
 if(location.pathname!=='/watch')return null;
 const full=document.fullscreenElement;
 if(full instanceof HTMLElement&&!(full instanceof HTMLVideoElement))return full;
 return document.querySelector<HTMLElement>('#movie_player.ytp-fullscreen,.html5-video-player.ytp-fullscreen,ytd-watch-flexy[fullscreen] #movie_player');
}
