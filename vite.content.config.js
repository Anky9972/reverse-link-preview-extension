import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite'

// Separate config for content script
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't empty since we're building incrementally
    lib: {
      entry: resolve(__dirname, 'src/content.jsx'),
      name: 'ContentScript',
      fileName: () => 'content.js',
      formats: ['iife']
    },
    rollupOptions: {
      external: [], // Bundle everything
      output: {
        globals: {},
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'content.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    minify: false, // Easier debugging
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});