// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act,createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {NotesHeader,useWatchTitle} from '../src/notes-header';
it('uses a decorative video thumbnail and an accessible X close button; recovers after image failure on SPA',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 const mount=document.createElement('div');document.body.append(mount);const root=createRoot(mount);const close=vi.fn();
 await act(async()=>{root.render(createElement(NotesHeader,{key:'a',videoId:'a',onClose:close}));});
 const img=mount.querySelector('img')!;expect(img.src).toBe('https://i.ytimg.com/vi/a/hqdefault.jpg');expect(img.alt).toBe('');expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
 const button=mount.querySelector('button')!;expect(button.getAttribute('aria-label')).toBe('메모 패널 닫기');expect(button.querySelector('svg')).not.toBeNull();await act(async()=>{button.click();});expect(close).toHaveBeenCalledTimes(1);
 await act(async()=>{img.dispatchEvent(new Event('error'));});expect(mount.querySelector('img')).toBeNull();expect(mount.querySelector('h2')!.textContent).toBe('PAUSE Notes');expect(mount.querySelector('button')).not.toBeNull();
 await act(async()=>{root.render(createElement(NotesHeader,{key:'b',videoId:'b',onClose:close}));});expect(mount.querySelector('img')!.src).toBe('https://i.ytimg.com/vi/b/hqdefault.jpg');
 await act(async()=>{root.unmount();});mount.remove();
});
it('shows the brand eyebrow above the video title when given',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;const mount=document.createElement('div');document.body.append(mount);const root=createRoot(mount);
 await act(async()=>{root.render(createElement(NotesHeader,{videoId:'abc',eyebrow:'PAUSE Notes',title:'영상 제목'}));});
 expect(mount.querySelector('.notes-eyebrow')!.textContent).toBe('PAUSE Notes');expect(mount.querySelector('h2')!.textContent).toBe('영상 제목');expect(mount.querySelector('h2')!.getAttribute('title')).toBe('영상 제목');
 expect(mount.querySelector('.notes-eyebrow')!.compareDocumentPosition(mount.querySelector('h2')!)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
 await act(async()=>{root.unmount();});mount.remove();
});
it('tracks the watch title across SPA navigation and ignores the YouTube suffix and notification count',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;const mount=document.createElement('div');document.body.append(mount);const root=createRoot(mount);
 const Probe=({id}:{id:string})=>createElement('span',null,useWatchTitle(id));
 document.title='(3) First video - YouTube';await act(async()=>{root.render(createElement(Probe,{id:'a'}));});expect(mount.textContent).toBe('First video');
 document.title='Second video - YouTube';await act(async()=>{document.dispatchEvent(new Event('yt-navigate-finish'));});expect(mount.textContent).toBe('Second video');
 const h1=document.createElement('h1');h1.className='ytd-watch-metadata';h1.textContent='From heading';document.body.append(h1);document.title='YouTube';
 await act(async()=>{root.render(createElement(Probe,{id:'b'}));});expect(mount.textContent).toBe('From heading');
 await act(async()=>{root.unmount();});mount.remove();h1.remove();
});
