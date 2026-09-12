import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

// adapt to helium: 菜单对接自研后端（后端权限模式），并新增 transformMenus 将扁平 SysMenuDTO 转为路由树
export namespace MenuApi {
  // adapt to helium: 后端 BaseEnum 按枚举 value 序列化为数字（DIR=0, MENU=1, BUTTON=2, EXTERNAL_LINK=3）
  export type MenuType = 0 | 1 | 2 | 3;

  /** 后端 SysMenuDTO */
  export interface SysMenuDTO {
    component?: string;
    externalLink?: string;
    icon?: string;
    id: string;
    menuType: MenuType;
    name: string;
    parentId: string;
    permission?: string;
    sort?: number;
    /** 0=禁用, 1=启用 */
    status?: 0 | 1;
  }
}

// adapt to helium: 菜单类型枚举值（与后端 MenuTypeEnum 一致）
export const MenuTypeEnum = {
  DIR: 0,
  MENU: 1,
  BUTTON: 2,
  EXTERNAL_LINK: 3,
} as const;

/** 树构建过程中的临时节点，附带原菜单 id/parentId/排序用于组装树 */
interface TreeNode extends RouteRecordStringComponent {
  _id: string;
  _parentId: string;
  _sort: number;
  children?: TreeNode[];
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
 * 将后端菜单 DTO 转换为路由树
 *
 * 字段映射约定（如与真实数据不符，按实际后端字段调整）：
 * - BUTTON 仅作权限标识，不生成路由
 * - 路由 path 由 component 派生（后端 DTO 无独立 path 字段），外链使用 externalLink
 * - component 为空时（多为目录）使用 BasicLayout 作为容器
 * - 外链使用 IFrameView 承载
 * - parentId=0 视为根节点
 */
function transformMenus(
  list: MenuApi.SysMenuDTO[],
): RouteRecordStringComponent[] {
  const nodes: TreeNode[] = list
    .filter((m) => m.menuType !== MenuTypeEnum.BUTTON)
    .map((m) => {
      const slug = m.component
        ? m.component.replaceAll(/[\\/]+/g, '-').replaceAll(/^-+|-+$/g, '')
        : `menu-${m.id}`;
      return {
        _id: m.id,
        _parentId: m.parentId ?? 0,
        _sort: m.sort ?? 0,
        component:
          m.menuType === MenuTypeEnum.EXTERNAL_LINK
            ? 'IFrameView'
            : m.component || 'BasicLayout',
        meta: {
          hideInMenu: m.status === 0,
          icon: m.icon,
          link: m.externalLink,
          order: m.sort ?? 0,
          title: m.name,
        },
        name: slug,
        path: m.externalLink || `/${(m.component || slug).replace(/^\/+/, '')}`,
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
        const result = route as RouteRecordStringComponent;
        if (children?.length) {
          result.children = toRoutes(children);
        }
        return result;
      });

  return toRoutes(roots);
}
