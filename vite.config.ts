import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_AWS_REGION': JSON.stringify(env.AWS_REGION),
        'import.meta.env.VITE_AWS_ACCESS_KEY_ID': JSON.stringify(env.AWS_ACCESS_KEY_ID),
        'import.meta.env.VITE_AWS_SECRET_ACCESS_KEY': JSON.stringify(env.AWS_SECRET_ACCESS_KEY),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'global': 'globalThis'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'crypto': 'crypto-browserify',
          'stream': 'stream-browserify',
          'buffer': 'buffer'
        }
      },
      optimizeDeps: {
        esbuildOptions: {
          define: {
            global: 'globalThis'
          }
        }
      }
    };
});
