import type { RouteMeta } from 'vue-router';

export interface RouteItem {
  path: string;
  component: any;
  meta: RouteMeta;
  name?: string;
  alias?: string | string[];
  redirect?: string;
  caseSensitive?: boolean;
  children?: RouteItem[];
  // Helio: 增加 父级ID 字段
  parentId: string;
}

/**
 * @description: Get menu return value
 */
export type getMenuListResultModel = RouteItem[];
