import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5122', // ✅ Backend server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
