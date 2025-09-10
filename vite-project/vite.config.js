import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // 必須
  ],
  server: {
    proxy: {
      '/customer-service': {
        target: 'https://zap-customer-st.benesse.ne.jp',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request:', proxyReq.path);
            console.log('Request headers:', req.headers);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response status:', proxyRes.statusCode);
            if (proxyRes.headers['set-cookie']) {
              proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => {
                return cookie
                  .replace(/Domain=benesse\.ne\.jp/gi, 'Domain=localhost')
                  .replace(/HttpOnly;?\s*/gi, '')
                  .replace(/Secure;?\s*/gi, '');
              });
              console.log('Modified set-cookie headers:', proxyRes.headers['set-cookie']);
            }
          });
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
        }
      },
      '/usage-history-service': {
        target: 'https://zap-customer-st.benesse.ne.jp',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request:', proxyReq.path);
            console.log('Request headers:', req.headers);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response status:', proxyRes.statusCode);
            if (proxyRes.headers['set-cookie']) {
              proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(cookie => {
                return cookie
                  .replace(/Domain=benesse\.ne\.jp/gi, 'Domain=localhost')
                  .replace(/HttpOnly;?\s*/gi, '')
                  .replace(/Secure;?\s*/gi, '');
              });
              console.log('Modified set-cookie headers:', proxyRes.headers['set-cookie']);
            }
          });
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
        }
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
})