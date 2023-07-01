import { presetTypography, presetUno } from 'unocss';
import UnoCSS from 'unocss/vite';
import { type UserConfig } from 'vite';

const commonConfig: UserConfig = {
  server: {
    host: true,
  },
  esbuild: {
    drop: ['debugger'],
  },
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      // TODO: Prevent memory overflow
      maxParallelFileOps: 3,
    },
  },
  plugins: [
    UnoCSS({
      presets: [presetUno(), presetTypography()],
      // Helio: 避免在较低版本Chrome(如v87)下开发时，无限转圈，无法到达登录页的问题
      hmrTopLevelAwait: false,
    }),
  ],
};

export { commonConfig };
