import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "static",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        paintWorklet: resolve(__dirname, 'src/renderers/paintWorklet.ts')
      },
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
})
