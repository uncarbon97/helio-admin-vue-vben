import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // adapt to helium: 开发代理指向自研后端（原 mock 为 http://localhost:5320/api）
            target: 'http://127.0.0.1:7003',
            ws: true,
          },
        },
      },
    },
  };
});
