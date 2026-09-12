import type { MenuApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { requestClient } from '#/api/request';

// adapt to helium: 菜单管理 CRUD（后端 AdminSysMenuController）
export namespace SysMenuApi {
  /** 新增/修改请求表单 */
  export interface UpsertRequest {
    /** 主键ID（新增时不传） */
    id?: string;
    /** 菜单名称 */
    name: string;
    /** 上级菜单ID（根菜单传 0） */
    parentId: string;
    /** 菜单类型 0=目录 1=菜单 2=按钮 3=外链 */
    menuType: MenuApi.MenuType;
    /** 前端组件名称 */
    component?: string;
    /** 授权标识 */
    permission?: string;
    /** 图标 */
    icon?: string;
    /** 排序 */
    sort: number;
    /** 状态 */
    status: EnabledStatusEnum;
    /** 外链地址 */
    externalLink?: string;
  }

  /** 树节点（由扁平 SysMenuDTO 构建，保留全字段） */
  export interface MenuTreeNode extends MenuApi.SysMenuDTO {
    children?: MenuTreeNode[];
  }
}

/**
 * 列表查询（无分页，返回全量扁平列表）
 */
async function getMenuList() {
  return requestClient.post<MenuApi.SysMenuDTO[]>('/v1/sys/menu/list');
}

/**
 * 详情
 * @param id ID
 */
async function getMenuDetail(id: string) {
  return requestClient.post<MenuApi.SysMenuDTO>('/v1/sys/menu/detail', {
    id,
  });
}

/**
 * 新增
 * @param request 请求表单
 */
async function createMenu(request: SysMenuApi.UpsertRequest) {
  return requestClient.post('/v1/sys/menu/create', request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateMenu(request: SysMenuApi.UpsertRequest) {
  return requestClient.post('/v1/sys/menu/update', request);
}

/**
 * 删除
 * @param id 菜单ID
 */
async function deleteMenu(id: string) {
  return requestClient.post('/v1/sys/menu/delete', { id });
}

/**
 * 修改状态（启用/禁用）
 * @param ids 菜单ID列表
 * @param newStatus 新状态
 */
async function setMenuStatus(ids: string[], newStatus: EnabledStatusEnum) {
  return requestClient.post('/v1/sys/menu/set-status', {
    ids,
    newStatus,
  });
}

/**
 * 将扁平菜单列表按 parentId（0 为根）构建为全字段树，并按 sort 排序
 */
function buildMenuTreeFull(list: MenuApi.SysMenuDTO[]): SysMenuApi.MenuTreeNode[] {
  const nodes = new Map<string, SysMenuApi.MenuTreeNode>();
  list.forEach((item) => {
    nodes.set(item.id, { ...item, children: [] });
  });

  const roots: SysMenuApi.MenuTreeNode[] = [];
  list.forEach((item) => {
    const node = nodes.get(item.id)!;
    const parent = nodes.get(item.parentId ?? '0');
    if (parent) {
      (parent.children ??= []).push(node);
    } else {
      roots.push(node);
    }
  });

  const toTree = (
    items: SysMenuApi.MenuTreeNode[],
  ): SysMenuApi.MenuTreeNode[] =>
    items
      .toSorted((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map(({ children, ...rest }) => ({
        ...rest,
        children: children?.length ? toTree(children) : undefined,
      }));

  return toTree(roots);
}

/** 权限树节点（由扁平 SysMenuDTO 构建） */
export interface MenuTreeNode {
  children?: MenuTreeNode[];
  icon?: string;
  id: string;
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
  const nodes = new Map<string, SortableNode>();
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
        // adapt to helium: 修复类型收窄（children 声明为 MenuTreeNode[]，此处实为 SortableNode[]）
        children: children?.length
          ? toTree(children as SortableNode[])
          : undefined,
      }));

  return toTree(roots);
}

export {
  buildMenuTree,
  buildMenuTreeFull,
  createMenu,
  deleteMenu,
  getMenuDetail,
  getMenuList,
  getVisibleMenuList,
  setMenuStatus,
  updateMenu,
};
