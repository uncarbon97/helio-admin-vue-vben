import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

// helium customization: 个人中心固定注册（backend 权限模式下 modules/ 动态路由不注册，导致无法跳转）
const routes: RouteRecordRaw[] = [
  {
    // 独立注册于 Root 之外，需自带布局容器（否则整页铺满、无法回退导航）
    component: () => import('#/layouts/basic.vue'),
    meta: {
      hideInMenu: true,
      icon: 'lucide:user',
      title: $t('page.auth.profile'),
    },
    name: 'Profile',
    path: '/profile',
    redirect: { name: 'ProfilePage' },
    children: [
      {
        name: 'ProfilePage',
        path: '',
        component: () => import('#/views/_core/profile/index.vue'),
        meta: {
          hideInMenu: true,
          title: $t('page.auth.profile'),
        },
      },
    ],
  },
];

export default routes;
