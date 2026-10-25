import type {
  EnabledStatusEnumValue,
  GenderEnumValue,
  PageParam,
  PageResult,
  YesOrNoEnumValue,
} from '#/api/common';

import { requestClient } from '#/api/request';

export namespace SysUserApi {
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 手机号后4位（精确匹配） */
    phoneNoTail4?: string;
    /** 选中的部门ID（左侧部门树联动） */
    selectedDeptId?: string;
  }

  /** 新增请求表单 */
  export interface CreateRequest {
    /** 账号（5-16位） */
    pin: string;
    /** 昵称（0-20位） */
    nickname: string;
    /** 性别 */
    gender: GenderEnumValue;
    /** 邮箱 */
    email: string;
    /** 手机号 */
    phoneNo: string;
    /** 初始密码（5-20位明文） */
    initPwd: string;
    /** 所属部门ID */
    deptId?: string;
  }

  /** 修改请求表单 */
  export interface UpdateRequest {
    /** 主键ID */
    id: string;
    /** 账号（5-16位） */
    pin: string;
    /** 昵称（0-20位） */
    nickname: string;
    /** 性别 */
    gender: GenderEnumValue;
    /** 邮箱 */
    email: string;
    /** 手机号 */
    phoneNo: string;
  }

  /** 值对象 */
  export interface SysUserDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    /** 账号 */
    pin: string;
    /** 昵称 */
    nickname: string;
    /** 性别 */
    gender: GenderEnumValue;
    /** 状态 */
    status: EnabledStatusEnumValue;
    /** 最后登录时间 */
    lastLoginAt: null | string;
    /** 头像地址 */
    avatarUrl: null | string;
    /** 手机号脱敏展示，如 189****8927 */
    phoneNoMasked: null | string;
    /** 邮箱脱敏展示，如 al***@example.com */
    emailMasked: null | string;
    /** 所属部门ID */
    deptId: null | string;
    /** 所属部门名称 */
    deptName: null | string;
  }

  /** 全局找人结果（仅用户优先模式） */
  export interface TenantUserLookupVO {
    /** 用户ID */
    userId: string;
    /** 账号 */
    pin: string;
    /** 昵称 */
    nickname: null | string;
    /** 手机号 */
    phoneNo: null | string;
    /** 邮箱 */
    email: null | string;
    /** 是否已是本租户成员 */
    memberFlag: boolean;
  }
}

const API_PATH = '/v1/sys/user';

/**
 * 分页查询
 */
async function getUserList(data: SysUserApi.ListQuery) {
  return requestClient.post<PageResult<SysUserApi.SysUserDTO>>(
    `${API_PATH}/list`,
    data,
  );
}

/**
 * 详情
 * @param id 用户ID
 */
async function getUserDetail(id: string) {
  return requestClient.post<SysUserApi.SysUserDTO>(`${API_PATH}/detail`, {
    id,
  });
}

/**
 * 新增
 * @param request 请求表单
 */
async function createUser(request: SysUserApi.CreateRequest) {
  return requestClient.post(`${API_PATH}/create`, request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateUser(request: SysUserApi.UpdateRequest) {
  return requestClient.post(`${API_PATH}/update`, request);
}

/**
 * 删除
 * @param id 用户ID
 */
async function deleteUser(id: string) {
  return requestClient.post(`${API_PATH}/delete`, { id });
}

/**
 * 修改状态（启用/禁用）
 * @param id 用户ID
 * @param newStatus 新状态
 */
async function setUserStatus(
  id: string,
  newStatus: EnabledStatusEnumValue,
) {
  return requestClient.post(`${API_PATH}/set-status`, {
    id,
    newStatus,
  });
}

/**
 * 重置指定用户密码
 * @param userId 用户ID
 * @param randomPassword 随机密码（16-64位）
 * @param pwdMustChange 是否要求下次登录改密
 */
async function resetUserPassword(
  userId: string,
  randomPassword: string,
  pwdMustChange: YesOrNoEnumValue,
) {
  return requestClient.post(`${API_PATH}/reset-password`, {
    pwdMustChange,
    randomPassword,
    userId,
  });
}

/**
 * 查询用户已关联的角色ID列表
 * @param userId 用户ID
 */
async function listRelatedRole(userId: string) {
  return requestClient.post<string[]>(`${API_PATH}/list-related-role`, {
    id: userId,
  });
}

/**
 * 绑定用户角色
 * @param userId 用户ID
 * @param roleIds 角色IDs；为空则解除所有绑定
 */
async function bindUserRole(userId: string, roleIds: string[]) {
  return requestClient.post(`${API_PATH}/bind-role`, {
    roleIds,
    userId,
  });
}

/**
 * 绑定用户部门
 * @param userId 用户ID
 * @param deptId 部门ID；传 null 解除绑定
 */
async function bindUserDept(userId: string, deptId: null | string) {
  return requestClient.post(`${API_PATH}/bind-dept`, {
    deptId,
    userId,
  });
}

/**
 * 踢下线
 * @param id 用户ID
 */
async function kickOutUser(id: string) {
  return requestClient.post(`${API_PATH}/kick-out`, { id });
}

/**
 * 全局找人（仅用户优先模式）
 * @param data 账号 / 完整手机号，至少填一项
 */
async function lookupTenantUsers(data: { phoneNo?: string; pin?: string }) {
  return requestClient.post<SysUserApi.TenantUserLookupVO[]>(
    `${API_PATH}/lookup`,
    data,
  );
}

/**
 * 加入本租户（仅用户优先模式，目标租户取当前会话上下文）
 * @param pin 账号
 * @param roleIds 初始角色IDs；为空则不绑定角色
 */
async function joinTenantUser(pin: string, roleIds?: string[]) {
  return requestClient.post(`${API_PATH}/tenant-join`, { pin, roleIds });
}

/**
 * 移出租户（仅用户优先模式，成功后该用户被强制下线）
 * @param userId 用户ID
 */
async function expelTenantUser(userId: string) {
  return requestClient.post(`${API_PATH}/tenant-expel`, { userId });
}

export {
  bindUserDept,
  bindUserRole,
  createUser,
  deleteUser,
  expelTenantUser,
  getUserDetail,
  getUserList,
  joinTenantUser,
  kickOutUser,
  listRelatedRole,
  lookupTenantUsers,
  resetUserPassword,
  setUserStatus,
  updateUser,
};
