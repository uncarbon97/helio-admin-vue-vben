import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

// helium customization: 固定注册 dashboard，不依赖后端菜单（backend 权限模式下 modules/ 目录不注册）
const routes: RouteRecordRaw[] = [
  {
    // 独立注册于 Root 之外，需自带布局容器
    component: () => import('#/layouts/basic.vue'),
    meta: {
      // helium customization: 离线环境，图标改用本地打包的 ant-design 集（避免运行时请求 api.iconify.design）
      icon: 'ant-design:dashboard-outlined',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    // helium customization: 新增极简首页 workbench 作默认落地页：/dashboard 重定向至此、新增 Workbench 子路由（affixTab+order:1），并移除 Analytics 的 affixTab（通用后台模板）
    redirect: '/dashboard/workbench',
    children: [
      {
        name: 'Workbench',
        path: 'workbench',
        component: () => import('#/views/dashboard/workbench/index.vue'),
        meta: {
          affixTab: false,
          icon: 'ant-design:dashboard-outlined',
          order: 1,
          title: $t('page.dashboard.workbench.title'),
        },
      },
    ],
  },
];

export default routes;
