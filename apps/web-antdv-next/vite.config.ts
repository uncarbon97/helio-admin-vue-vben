import { defineConfig } from '@vben/vite-config';

// helium customization: 代码生成器制品落盘后自动同步 barrel
import { run as genApiBarrels } from './scripts/gen-api-barrels.mjs';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        {
          name: 'helium:gen-api-barrels',
          // dev 启动与 build 均触发；幂等，无变化不写文件
          buildStart() {
            genApiBarrels();
          },
        },
      ],
      server: {
        proxy: {
          // helium customization: 无需本地开发代理
        },
      },
    },
  };
});
