import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // SPA shell + History API router — deep links work in `vite` / `vite preview`
  appType: 'spa',
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
    // Single HTML entry; client router handles /benefits, /events, etc.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
