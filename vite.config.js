import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/** CSS в <head> — видимо съдържание преди зареждане на JS */
function injectEarlyStyles() {
  return {
    name: 'crescendo-early-styles',
    transformIndexHtml(html) {
      if (html.includes('/src/styles/main.css')) return html;
      const tags = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="/src/styles/main.css" />`;
      return html.replace('</head>', `${tags}\n  </head>`);
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  root: '.',
  publicDir: 'public',
  plugins: [injectEarlyStyles()],
  server: {
    port: 3000,
    strictPort: true,
    open: false,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        benefits: resolve(__dirname, 'benefits.html'),
        policies: resolve(__dirname, 'policies.html'),
        practices: resolve(__dirname, 'practices.html'),
        elSistema: resolve(__dirname, 'el-sistema.html'),
        resonance: resolve(__dirname, 'resonance.html'),
        events: resolve(__dirname, 'events.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        addEvent: resolve(__dirname, 'add-event.html'),
        article: resolve(__dirname, 'article.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
});
