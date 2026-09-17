import http from 'node:http';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Dev/preview proxy to the Express API on :5000.
// 127.0.0.1 avoids IPv6 (::1) lookups; a fresh agent per request avoids reusing sockets the API
// already closed. If the API is down/restarting, answer 503 JSON flagged `x-api-unavailable`
// (the frontend retries those) instead of dropping the connection.
const apiProxy = {
  target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000',
  changeOrigin: true,
  agent: new http.Agent({ keepAlive: false }),
  configure: (proxy) => {
    proxy.on('error', (err, _req, res) => {
      if (!res || res.headersSent || typeof res.writeHead !== 'function') return;
      res.writeHead(503, { 'Content-Type': 'application/json', 'x-api-unavailable': '1' });
      res.end(JSON.stringify({ error: 'The API server is starting or restarting. Please try again in a moment.', code: err.code }));
    });
  },
};

// Node's default 5 s keep-alive makes browsers occasionally reuse a socket the dev server just
// closed. Keep idle sockets alive longer than any client reuses them.
const keepAlive = () => {
  const tune = (server) => {
    const srv = server.httpServer;
    if (!srv) return;
    srv.keepAliveTimeout = 65_000;
    srv.headersTimeout = 66_000;
  };
  return { name: 'px-keep-alive', configureServer: tune, configurePreviewServer: tune };
};

export default defineConfig({
  // basicSsl: local dev/preview run on https://localhost:5173 with a self-signed certificate
  plugins: [react(), basicSsl(), keepAlive()],
  server: {
    port: 5173,
    open: true,
    // API runs on :5000 during development (npm run dev starts both)
    proxy: { '/api': apiProxy },
  },
  preview: { proxy: { '/api': apiProxy } },
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
