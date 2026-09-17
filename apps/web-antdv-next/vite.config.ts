import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          // helium customization: 无需本地开发代理
        },
      },
    },
  };
});
