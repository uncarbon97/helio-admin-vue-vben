import {
  appCopyrightPreferences,
  defineOverridesPreferences,
} from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  // helium customization: 默认权限模式改 backend（菜单/权限取自后端）
  app: {
    accessMode: 'backend',
    // helium customization: 默认头像改本地资源（上游为 unpkg CDN 外链，离线内网不可用）
    defaultAvatar: '/images/avatar.svg',
    name: import.meta.env.VITE_APP_TITLE,
  },
  copyright: appCopyrightPreferences,
  // helium customization: LOGO 改本地资源（上游为 unpkg CDN 外链，离线内网不可用）
  logo: {
    source: '/images/logo.svg',
    sourceDark: '/images/logo.svg',
  },
  // helium customization: 隐藏右上角通知图标（无后端消息数据）
  widget: {
    notification: false,
  },
  // helium customization: 默认主题改 light
  theme: {
    mode: 'light',
  },
});
