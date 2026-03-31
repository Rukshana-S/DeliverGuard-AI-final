import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  ...(mode === 'production' && {
    define: {
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
    },
  }),
}));
