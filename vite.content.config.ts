import { defineConfig } from 'vite';
export default defineConfig({publicDir:false,define:{'process.env.NODE_ENV':JSON.stringify('production')},build:{emptyOutDir:false,lib:{entry:'src/content.tsx',name:'PauseContent',formats:['iife'],fileName:()=> 'content.js'}}});
