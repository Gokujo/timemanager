const react = require('@vitejs/plugin-react');
const tailwindcss = require('@tailwindcss/vite');
/** @type {import('vite').UserConfig} */
module.exports = {
    plugins: [react(), tailwindcss()],
    server: {
        port: 3001
    },
    preview: {
        port: 3001
    }
};


