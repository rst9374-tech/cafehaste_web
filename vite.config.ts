import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2022',
        minify: 'esbuild', // Faster minification via esbuild (significantly faster than Terser)
        sourcemap: false, // Turn off sourcemaps in production to dramatically cut memory & build time
        reportCompressedSize: false, // Turn off compressed size calculation to skip heavy gzip computations
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
          output: {
            manualChunks(id) {
              // Group and split large vendor libraries into independent parallel build chunks
              if (id.includes('node_modules')) {
                if (id.includes('three') || id.includes('@react-three')) {
                  return 'vendor-three-3d';
                }
                if (id.includes('framer-motion') || id.includes('motion')) {
                  return 'vendor-motion-animation';
                }
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react-core';
                }
                return 'vendor-utilities';
              }
            }
          }
        }
      }
    };
});
