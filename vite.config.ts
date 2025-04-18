// apps/genestream/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['genestream.io', 'localhost'],
    port: 5175,
    proxy: {
      '^/(projects|sequences|user|uploads|waitlist)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.method === 'GET' && req.url.startsWith('/waitlist')) return req.url;
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
