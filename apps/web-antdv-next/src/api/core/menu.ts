import type { RouteRecordStringComponent } from '@vben/types';

import { EnabledStatusEnum } from '#/api/common';
import { requestClient } from '#/api/request';

export namespace MenuApi {
  // helium customization: 后端 BaseEnum 按枚举 value 序列化为数字（DIR=0, MENU=1, BUTTON=2, EXTERNAL_LINK=3）
  export type MenuType = 0 | 1 | 2 | 3;

  /** 后端 SysMenuDTO（侧边菜单精简契约：目录无 component、path 为可读 slug） */
  export interface SysMenuDTO {
    component?: string;
    externalLink?: string;
    icon?: string;
    id: string;
    menuType: MenuType;
    name: string;
    parentId: string;
    path: string;
    sort?: number;
    /** 0=禁用, 1=启用 */
    status?: 0 | 1;
  }
}

// helium customization: 菜单类型枚举值（与后端 MenuTypeEnum 一致）
export const MenuTypeEnum = {
  DIR: 0,
  MENU: 1,
  BUTTON: 2,
  EXTERNAL_LINK: 3,
} as const;

/** 树构建过程中的临时节点，附带原菜单 id/parentId/排序用于组装树 */
interface TreeNode
  extends Omit<RouteRecordStringComponent, 'children' | 'component'> {
  _id: string;
  _parentId: string;
  _sort: number;
  children?: TreeNode[];
  component?: string;
}

/**
 * 获取侧边菜单（后端权限模式），并将扁平 SysMenuDTO 列表转换为路由树
 */
export async function getAllMenusApi() {
  const list =
    await requestClient.post<MenuApi.SysMenuDTO[]>('/v1/sys/menu/side');
  return transformMenus(list ?? []);
}

/**
 * helium customization: 将后端扁平菜单 DTO 转换为 v5 规范路由树
 *
 * 约定（见 docs/src/guide/in-depth/access.md 后端访问控制示例）：
 * - BUTTON 仅作权限标识，不生成路由
 * - path 直接使用后端 DTO 的 path（目录为可读 slug，叶子为全路径）
 * - 目录无 component（BasicLayout 由根路由承担）；外链映射 IFrameView
 * - 有子节点时 redirect 到排序首个子节点（叶子 path 为绝对路径，accessible 不会自动生成 redirect）
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
