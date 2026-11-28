import type { RouteRecordStringComponent } from '@vben/types';

import type { EnabledStatusEnumValue } from '#/api/common';

import { EnabledStatusEnum } from '#/api/common';
import { requestClient } from '#/api/request';

export namespace MenuApi {
  /** 后端 SysMenuDTO */
  export interface SysMenuDTO {
    component?: string;
    externalLink?: string;
    icon?: string;
    id: string;
    menuType: MenuTypeEnumValue;
    name: string;
    parentId: string;
    path: string;
    sort?: number;
    status?: EnabledStatusEnumValue;
    visibleScope?: MenuVisibleScope;
  }
}

const API_PATH = '/v1/sys/menu';

// helium customization: 菜单类型枚举值（与后端 MenuTypeEnum 一致）
export const MenuTypeEnum = {
  DIR: 0,
  MENU: 1,
  BUTTON: 2,
  EXTERNAL_LINK: 3,
} as const;

export type MenuTypeEnumValue =
  (typeof MenuTypeEnum)[keyof typeof MenuTypeEnum];

// helium customization: 菜单可见范围枚举值（与后端 MenuVisibleScopeEnum 一致）
export const MenuVisibleScopeEnum = {
  ALL: 1,
  SUPER_ADMIN_ONLY: 2,
} as const;

export type MenuVisibleScope =
  (typeof MenuVisibleScopeEnum)[keyof typeof MenuVisibleScopeEnum];

/** 树构建临时节点：附原菜单 id/parentId/排序 */
interface TreeNode extends Omit<
  RouteRecordStringComponent,
  'children' | 'component'
> {
  _id: string;
  _parentId: string;
  _sort: number;
  children?: TreeNode[];
  component?: string;
}

/** 获取侧边菜单（后端权限模式）并转为路由树 */
export async function getAllMenusApi() {
  const list =
    await requestClient.post<MenuApi.SysMenuDTO[]>(`${API_PATH}/side`);
  return transformMenus(list ?? []);
}

/**
 * helium customization: 扁平菜单 DTO 转 v5 规范路由树
 * - BUTTON 仅作权限标识，不生成路由
 * - 目录无 component（BasicLayout 由根路由承担）；外链映射 IFrameView
 * - 有子节点时 redirect 到排序首个子节点
 */
function transformMenus(
  list: MenuApi.SysMenuDTO[],
): RouteRecordStringComponent[] {
  const nodes: TreeNode[] = list
    .filter((m) => m.menuType !== MenuTypeEnum.BUTTON)
    .map((m) => {
      const slug = m.path.replaceAll(/[\\/]+/g, '-').replaceAll(/^-+|-+$/g, '');
      return {
        _id: m.id,
        _parentId: m.parentId ?? '',
        _sort: m.sort ?? 0,
        component:
          m.menuType === MenuTypeEnum.EXTERNAL_LINK
            ? 'IFrameView'
            : m.component,
        meta: {
          hideInMenu: m.status === EnabledStatusEnum.DISABLED,
          icon: m.icon,
          link: m.externalLink,
          order: m.sort ?? 0,
          title: m.name,
        },
        name: slug,
        path: m.externalLink || m.path,
      };
    });

  const nodeMap = new Map<string, TreeNode>();
  nodes.forEach((node) => nodeMap.set(node._id, node));

  const roots: TreeNode[] = [];
  nodes.forEach((node) => {
    const parent = nodeMap.get(node._parentId);
    if (parent) {
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const toRoutes = (items: TreeNode[]): RouteRecordStringComponent[] =>
    items
      .toSorted((a, b) => a._sort - b._sort)
      .map(({ _id, _parentId, _sort, ...rest }) => {
        const { children, ...route } = rest;
        const result = route as unknown as RouteRecordStringComponent;
        if (children?.length) {
          const childRoutes = toRoutes(children);
          result.children = childRoutes;
          result.redirect = childRoutes[0]?.path;
        }
        return result;
      });

  return toRoutes(roots);
}
