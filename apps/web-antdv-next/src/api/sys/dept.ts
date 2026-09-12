import type { EnabledStatusEnum } from '#/api/common';

import { requestClient } from '#/api/request';

export namespace SysDeptApi {
  /** 新增/修改请求表单 */
  export interface UpsertRequest {
    /** 主键ID（新增时不传） */
    id?: string;
    /** 部门名称 */
    name: string;
    /** 上级部门ID（根部门传 0） */
    parentId: string;
    /** 排序 */
    sort: number;
    /** 状态 */
    status: EnabledStatusEnum;
  }

  /** 值对象 */
  export interface SysDeptDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    /** 上级部门ID（根部门为 0） */
    parentId: string;
    sort: number;
    status: EnabledStatusEnum;
  }

  /** 树节点（由扁平 SysDeptDTO 构建） */
  export interface DeptTreeNode extends SysDeptDTO {
    children?: DeptTreeNode[];
  }
}

/**
 * 列表查询（无分页，返回全量扁平列表）
 */
async function getDeptList() {
  return requestClient.post<SysDeptApi.SysDeptDTO[]>('/v1/sys/dept/list');
}

/**
 * 详情
 * @param id ID
 */
async function getDeptDetail(id: string) {
  return requestClient.post<SysDeptApi.SysDeptDTO>('/v1/sys/dept/detail', {
    id,
  });
}

/**
 * 新增
 * @param request 请求表单
 */
async function createDept(request: SysDeptApi.UpsertRequest) {
  return requestClient.post('/v1/sys/dept/create', request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateDept(request: SysDeptApi.UpsertRequest) {
  return requestClient.post('/v1/sys/dept/update', request);
}

/**
 * 删除
 * @param id 部门ID
 */
async function deleteDept(id: string) {
  return requestClient.post('/v1/sys/dept/delete', { id });
}

/**
 * 修改状态（启用/禁用）
 * @param ids 部门ID列表
 * @param newStatus 新状态
 */
async function setDeptStatus(ids: string[], newStatus: EnabledStatusEnum) {
  return requestClient.post('/v1/sys/dept/set-status', {
    ids,
    newStatus,
  });
}

/**
 * 将扁平部门列表按 parentId（0 为根）构建为树（顺序由后端保证）
 */
function buildDeptTree(
  list: SysDeptApi.SysDeptDTO[],
): SysDeptApi.DeptTreeNode[] {
  const nodes = new Map<string, SysDeptApi.DeptTreeNode>();
  list.forEach((item) => {
    nodes.set(item.id, { ...item, children: [] });
  });

  const roots: SysDeptApi.DeptTreeNode[] = [];
  list.forEach((item) => {
    const node = nodes.get(item.id)!;
    const parent = nodes.get(item.parentId ?? '0');
    if (parent) {
      (parent.children ??= []).push(node);
    } else {
      roots.push(node);
    }
  });

  const toTree = (items: SysDeptApi.DeptTreeNode[]): SysDeptApi.DeptTreeNode[] =>
    items.map(({ children, ...rest }) => ({
      ...rest,
      children: children?.length ? toTree(children) : undefined,
    }));

  return toTree(roots);
}

export {
  buildDeptTree,
  createDept,
  deleteDept,
  getDeptDetail,
  getDeptList,
  setDeptStatus,
  updateDept,
};
