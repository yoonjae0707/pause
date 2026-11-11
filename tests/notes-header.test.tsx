// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act,createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {NotesHeader} from '../src/notes-header';
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
