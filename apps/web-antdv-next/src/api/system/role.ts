import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  /** 角色状态 */
  export type RoleStatus = 'DISABLED' | 'ENABLED';

  /** 分页查询参数 */
  export interface PageParam {
    /** 当前页码 */
    pageNum: number;
    /** 当前页大小 */
    pageSize: number;
  }

  /** 角色列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 角色编码(关键词) */
    code?: string;
    /** 角色名称(关键词) */
    name?: string;
  }

  /** 角色新增/修改入参 */
  export interface UpsertRequest {
    /** 角色编码 */
    code: string;
    /** 角色描述 */
    description: string;
    /** 主键ID（新增时不传） */
    id?: string;
    /** 角色名称 */
    name: string;
  }

  /** 后端 SysRoleDTO */
  export interface SysRole {
    id: string;
    createdAt: string;
    updatedAt: string;
    code: string;
    description: string;
    /** 角色特殊标记 */
    flags: string[];
    /** 可见菜单Ids */
    menuIds: number[];
    name: string;
    status: RoleStatus;
  }

  /** 后端 PageResult */
  export interface PageResult<T> {
    /** 当前页 */
    current: number;
    /** 记录 */
    records: T[];
    /** 当前页数量 */
    size: number;
    /** 总量 */
    total: number;
  }
}

/**
 * 分页查询角色列表
 */
async function getRoleList(data: SystemRoleApi.ListQuery) {
  return requestClient.post<SystemRoleApi.PageResult<SystemRoleApi.SysRole>>(
    '/v1/sys/role/list',
    data,
  );
}

/**
 * 角色详情
 * @param id 角色ID
 */
async function getRoleDetail(id: string) {
  return requestClient.post<SystemRoleApi.SysRole>('/v1/sys/role/detail', {
    id,
  });
}

/**
 * 新增角色
 * @param data 角色数据
 * @returns 新角色ID
 */
async function createRole(data: SystemRoleApi.UpsertRequest) {
  return requestClient.post<string>('/v1/sys/role/create', data);
}

/**
 * 修改角色
 * @param data 角色数据（含 id）
 */
async function updateRole(data: SystemRoleApi.UpsertRequest) {
  return requestClient.post('/v1/sys/role/update', data);
}

/**
 * 删除角色
 * @param id 角色ID
 */
async function deleteRole(id: string) {
  return requestClient.post('/v1/sys/role/delete', { id });
}

/**
 * 绑定角色菜单
 * @param roleId 角色ID
 * @param menuIds 菜单IDs；为空则解除所有绑定
 */
async function bindRoleMenu(roleId: string, menuIds: string[]) {
  return requestClient.post('/v1/sys/role/bind-menu', { menuIds, roleId });
}

export {
  bindRoleMenu,
  createRole,
  deleteRole,
  getRoleDetail,
  getRoleList,
  updateRole,
};
