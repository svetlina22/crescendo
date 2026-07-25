import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  appType: 'mpa',
  root: '.',
  publicDir: 'public',
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
        article: resolve(__dirname, 'article.html'),
      },
    },
  },
});
