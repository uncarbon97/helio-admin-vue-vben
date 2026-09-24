import type {
  EnabledStatusEnumValue,
  PageParam,
  PageResult,
} from '#/api/common';
import type { SysUserApi } from '#/api/sys/user';

import { requestClient } from '#/api/request';

export namespace SysRoleApi {
  /** 角色关联用户列表查询条件 */
  export interface ListRelatedUserQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 角色ID */
    roleId: string;
    /** 关键词(账号/昵称) */
    keyword?: string;
  }
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 角色编码(关键词) */
    code?: string;
    /** 角色名称(关键词) */
    name?: string;
  }

  /** 新增/修改请求表单 */
  export interface UpsertRequest {
    /** 主键ID（新增时不传） */
    id?: string;
    /** 角色编码 */
    code: string;
    /** 角色描述 */
    description: string;
    /** 角色名称 */
    name: string;
  }

  /** 值对象 */
  export interface SysRoleDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    code: string;
    description: string;
    /** 角色特殊标记 */
    flags: string[];
    /** 可见菜单Ids */
    menuIds: string[];
    name: string;
    status: EnabledStatusEnumValue;
  }
}

const API_PATH = '/v1/sys/role';

/**
 * 分页查询
 */
async function getRoleList(data: SysRoleApi.ListQuery) {
  return requestClient.post<PageResult<SysRoleApi.SysRoleDTO>>(
    `${API_PATH}/list`,
    data,
  );
}

/**
 * 详情
 * @param id ID
 */
async function getRoleDetail(id: string) {
  return requestClient.post<SysRoleApi.SysRoleDTO>(`${API_PATH}/detail`, {
    id,
  });
}

/**
 * 新增
 * @param request 请求表单
 * @returns 新记录ID
 */
async function createRole(request: SysRoleApi.UpsertRequest) {
  return requestClient.post<string>(`${API_PATH}/create`, request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateRole(request: SysRoleApi.UpsertRequest) {
  return requestClient.post(`${API_PATH}/update`, request);
}

/**
 * 删除
 * @param id 角色ID
 */
async function deleteRole(id: string) {
  return requestClient.post(`${API_PATH}/delete`, { id });
}

/**
 * 绑定角色菜单
 * @param roleId 角色ID
 * @param menuIds 菜单IDs；为空则解除所有绑定
 */
async function bindRoleMenu(roleId: string, menuIds: string[]) {
  return requestClient.post(`${API_PATH}/bind-menu`, { menuIds, roleId });
}

/**
 * 分页查询角色关联用户
 * @param data 查询条件
 */
async function listRelatedUser(data: SysRoleApi.ListRelatedUserQuery) {
  return requestClient.post<PageResult<SysUserApi.SysUserDTO>>(
    `${API_PATH}/list-related-user`,
    data,
  );
}

/**
 * 查询角色关联的用户ID列表
 * @param id 角色ID
 */
async function listRelatedUserId(id: string) {
  return requestClient.post<string[]>(`${API_PATH}/list-related-user-id`, {
    id,
  });
}

/**
 * 修改状态（启用/禁用）
 * @param id 角色ID
 * @param newStatus 新状态
 */
async function setRoleStatus(
  id: string,
  newStatus: EnabledStatusEnumValue,
) {
  return requestClient.post(`${API_PATH}/set-status`, {
    id,
    newStatus,
  });
}

export {
  bindRoleMenu,
  createRole,
  deleteRole,
  getRoleDetail,
  getRoleList,
  listRelatedUser,
  listRelatedUserId,
  setRoleStatus,
  updateRole,
};
