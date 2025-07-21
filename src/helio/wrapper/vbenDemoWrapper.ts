import { AppRouteRecordRaw } from "@/router/types";
import { LAYOUT } from "@/router/constant";
import { ref } from "vue";

/**
 * 包装Vben内置Demo到一个菜单目录中
 * @param asyncRoutes
 */
export function wrapVbenDemoRoutes(asyncRoutes: AppRouteRecordRaw[]) {
  const wrappedRoute: AppRouteRecordRaw = {
    path: '/demo',
    name: 'Vben内置Demo',
    component: LAYOUT,
    meta: {
      title: 'Vben内置Demo',
      icon: 'ion:layers-outline',
    },
    children: asyncRoutes.map(route => ({
      ...route,
      path: route.path.startsWith('/') ? route.path.slice(1) : route.path,
    })),
  };

  return wrappedRoute;
}

const STORAGE_KEYS = {
  showVbenDemoFlag: 'showVbenDemoFlag',
}
export function saveShowVbenDemoFlag(val: boolean) {
  localStorage.setItem(STORAGE_KEYS.showVbenDemoFlag, val);
}
export function getShowVbenDemoFlag(): boolean {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.showVbenDemoFlag));
}
