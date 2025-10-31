import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3001
    },
    preview: {
        port: 3001
    }
});
