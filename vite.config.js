import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  // basicSsl: local dev/preview run on https://localhost:5173 with a self-signed certificate
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    open: true,
    // API runs on :5000 during development (npm run dev starts both)
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
  preview: { proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});
