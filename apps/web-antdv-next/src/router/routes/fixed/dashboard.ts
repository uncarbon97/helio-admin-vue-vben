import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

// adapt to helium: 固定注册 dashboard，不依赖后端菜单（backend 权限模式下 modules/ 目录不注册）
const routes: RouteRecordRaw[] = [
  {
    // 独立注册于 Root 之外，需自带布局容器
    component: () => import('#/layouts/basic.vue'),
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    // adapt to helium: 新增极简首页 workbench 作默认落地页：/dashboard 重定向至此、新增 Workbench 子路由（affixTab+order:1），并移除 Analytics 的 affixTab（通用后台模板）
    redirect: '/dashboard/workbench',
    children: [
      {
        name: 'Workbench',
        path: 'workbench',
        component: () => import('#/views/dashboard/workbench/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:layout-dashboard',
          order: 1,
          title: $t('page.dashboard.workbench.title'),
        },
      },
      {
        name: 'Analytics',
        path: 'analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: 'workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
    ],
  },
];

export default routes;
