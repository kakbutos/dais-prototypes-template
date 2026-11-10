import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets + hash routes work on both / and /repository-name/ on Pages.
export default defineConfig({ plugins: [react()], base: './' });
