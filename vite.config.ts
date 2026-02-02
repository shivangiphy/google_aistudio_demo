import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './', // Using relative paths makes it easier to deploy to any subfolder
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      port: 3000,
      host: '127.0.0.1',
      hmr: false // Disable HMR when using VS Code Live Preview
    },
    plugins: [
      react(),
      {
        name: 'copy-sw',
        apply: 'build',
        generateBundle() {
          const swContent = fs.readFileSync('./sw.js', 'utf-8');
          this.emitFile({
            type: 'asset',
            fileName: 'sw.js',
            source: swContent,
          });
        },
      },
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
