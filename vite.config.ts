import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Relative assets + hash routes work on both / and /repository-name/ on Pages.
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';
  return {
    plugins: [react(), ...(offline ? [viteSingleFile()] : [])],
    base: './',
    build: offline ? { outDir: 'dist-html' } : undefined,
  };
});
