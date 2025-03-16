import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()); // ✅ Load .env

  console.log("🔍 Loaded API Base URL:", env.VITE_API_URL); // ✅ Debugging

  return {
    plugins: [react()],
    server: mode === 'development' ? {
      proxy: {
        '/api': {
          target: 'http://localhost:5122', // ✅ Always use localhost in dev
          changeOrigin: true,
          secure: false,
        },
      },
    } : undefined,
    resolve: {
      alias: {
        '@api': '/src/utils/api',  // Resolves the @api alias to the correct path
      },
    },
  };
});
