// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {act,createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {NotesReveal} from '../src/notes-reveal';
it('stays closed initially, expands only on request, and cancels stale close timers on rapid reopen',async()=>{
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;vi.useFakeTimers();const mount=document.createElement('div');document.body.append(mount);const root=createRoot(mount);
 const render=async(open:boolean)=>{await act(async()=>{root.render(createElement(NotesReveal,{open,children:createElement('textarea',{defaultValue:'draft'})}));});};
 await render(false);expect(mount.querySelector('textarea')).toBeNull();await render(true);expect(mount.querySelector('[data-open]')).toBeNull();await act(async()=>{vi.advanceTimersByTime(64);});expect(mount.querySelector('[data-open]')).not.toBeNull();
 await render(false);expect(mount.querySelector('[aria-hidden="true"]')).not.toBeNull();expect(mount.querySelector('[inert]')).not.toBeNull();expect(mount.querySelector('textarea')).not.toBeNull();await act(async()=>{vi.advanceTimersByTime(100);});await render(true);await act(async()=>{vi.advanceTimersByTime(600);});expect(mount.querySelectorAll('textarea')).toHaveLength(1);expect(mount.querySelector('[data-open]')).not.toBeNull();
 await render(false);await act(async()=>{vi.advanceTimersByTime(560);});expect(mount.querySelector('textarea')).toBeNull();await act(async()=>{root.unmount();});vi.useRealTimers();mount.remove();
});
