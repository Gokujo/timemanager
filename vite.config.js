import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
    plugins: [react()],
    css: {
        postcss: './postcss.config.js'
    },
    server: {
        port: 3001
    },
    preview: {
        port: 3001
    }
});
