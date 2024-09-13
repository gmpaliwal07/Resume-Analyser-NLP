import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/predict': {
        target: 'http://127.0.0.1:3000',  // Flask server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
