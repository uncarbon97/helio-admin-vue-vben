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
            // 后端接口地址
            target: 'http://127.0.0.1:7003',
            ws: true,
          },
        },
      },
    },
  };
});
