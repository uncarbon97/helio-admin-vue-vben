import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

// adapt to helium: 强制修改密码页（mustChangePassword=YES 时守卫强制跳转至此），固定注册、不依赖后端菜单
const routes: RouteRecordRaw[] = [
  {
    component: () => import('#/views/_core/profile/change-password.vue'),
    meta: {
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
    name: 'ChangePassword',
    path: '/profile/change-password',
  },
];

export default routes;
