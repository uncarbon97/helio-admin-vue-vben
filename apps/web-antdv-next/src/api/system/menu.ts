// adapt to helium: 对接自研后端菜单接口（POST /admin/v1/sys/menu/visible，见根目录 swagger.json）
// baseURL 已含 /admin（VITE_GLOB_API_URL），此处路径以 /v1 开头
import type { MenuApi } from '#/api';

import { requestClient } from '#/api/request';

/** 权限树节点（由扁平 SysMenuDTO 构建） */
export interface MenuTreeNode {
  children?: MenuTreeNode[];
  icon?: string;
  id: number;
  menuType: MenuApi.MenuType;
  name: string;
}

/**
 * 获取所有可见菜单（扁平列表），用于角色授权树
 */
async function getVisibleMenuList() {
  return requestClient.post<MenuApi.SysMenuDTO[]>('/v1/sys/menu/visible');
}

/** 树构建临时节点，附带排序字段 */
interface SortableNode extends MenuTreeNode {
  _sort: number;
}

/**
 * 将扁平菜单列表按 parentId（0 为根）构建为树，并按 sort 排序
 */
function buildMenuTree(list: MenuApi.SysMenuDTO[]): MenuTreeNode[] {
  const nodes = new Map<number, SortableNode>();
  list.forEach((item) => {
    nodes.set(item.id, {
      _sort: item.sort ?? 0,
      children: [],
      icon: item.icon,
      id: item.id,
      menuType: item.menuType,
      name: item.name,
    });
  });

  const roots: SortableNode[] = [];
  list.forEach((item) => {
    const node = nodes.get(item.id)!;
    const parent = nodes.get(item.parentId ?? 0);
    if (parent) {
      (parent.children ??= []).push(node);
    } else {
      roots.push(node);
    }
  });

  const toTree = (items: SortableNode[]): MenuTreeNode[] =>
    items
      .toSorted((a, b) => a._sort - b._sort)
      .map(({ _sort, children, ...rest }) => ({
        ...rest,
        children: children?.length ? toTree(children) : undefined,
      }));

  return toTree(roots);
}

export { buildMenuTree, getVisibleMenuList };
