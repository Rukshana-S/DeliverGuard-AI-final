import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    historyApiFallback: true,
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
