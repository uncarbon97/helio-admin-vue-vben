import type {
  EnabledStatusEnum,
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
    /** 手机号(关键词) */
    phoneNo?: string;
    /** 选中的部门ID（左侧部门树联动） */
    selectedDeptId?: string;
  }

  /** 新增请求表单 */
  export interface CreateRequest {
    /** 账号（5-16位） */
    pin: string;
    /** 首次登录是否要求修改密码（后端 YesOrNoEnum，按整数 0/1 输出） */
    mustChangePassword: YesOrNoEnumValue;
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

  /** 修改请求表单（无 deptId，改部门走 bind-dept；mustChangePassword 由重置密码抽屉统一设置，修改时不上送） */
  export interface UpdateRequest {
    /** 主键ID */
    id: string;
    /** 账号（5-16位） */
    pin: string;
    /** 首次登录是否要求修改密码（契约必填，前端修改时省略） */
    mustChangePassword?: YesOrNoEnumValue;
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
    /** 状态 */
    status: EnabledStatusEnum;
    /** 性别 */
    gender: GenderEnumValue;
    /** 邮箱 */
    email: string;
    /** 手机号 */
    phoneNo: string;
    /** 最后登录时间 */
    lastLoginAt: null | string;
    /** 所属部门ID */
    deptId: null | string;
    /** 所属部门名称 */
    deptName: null | string;
    /** 头像地址 */
    avatarUrl: null | string;
  }
}

/**
 * 分页查询
 */
async function getUserList(data: SysUserApi.ListQuery) {
  return requestClient.post<PageResult<SysUserApi.SysUserDTO>>(
    '/v1/sys/user/list',
    data,
  );
}

/**
 * 详情
 * @param id 用户ID
 */
async function getUserDetail(id: string) {
  return requestClient.post<SysUserApi.SysUserDTO>('/v1/sys/user/detail', {
    id,
  });
}

/**
 * 新增
 * @param request 请求表单
 */
async function createUser(request: SysUserApi.CreateRequest) {
  return requestClient.post('/v1/sys/user/create', request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateUser(request: SysUserApi.UpdateRequest) {
  return requestClient.post('/v1/sys/user/update', request);
}

/**
 * 删除
 * @param id 用户ID
 */
async function deleteUser(id: string) {
  return requestClient.post('/v1/sys/user/delete', { id });
}

/**
 * 修改状态（启用/禁用）
 * @param id 用户ID
 * @param newStatus 新状态
 */
async function setUserStatus(id: string, newStatus: EnabledStatusEnum) {
  return requestClient.post('/v1/sys/user/set-status', {
    id,
    newStatus,
  });
}

/**
 * 重置指定用户密码
 * @param userId 用户ID
 * @param randomPassword 随机密码（16-64位）
 * @param mustChangePassword 是否要求下次登录改密（swagger 契约暂未收录该字段，后端待补）
 */
async function resetUserPassword(
  userId: string,
  randomPassword: string,
  mustChangePassword: YesOrNoEnumValue,
) {
  return requestClient.post('/v1/sys/user/reset-password', {
    mustChangePassword,
    randomPassword,
    userId,
  });
}

/**
 * 查询用户已关联的角色ID列表
 * @param userId 用户ID
 */
async function listRelatedRole(userId: string) {
  return requestClient.post<string[]>('/v1/sys/user/list-related-role', {
    id: userId,
  });
}

/**
 * 绑定用户角色
 * @param userId 用户ID
 * @param roleIds 角色IDs；为空则解除所有绑定
 */
async function bindUserRole(userId: string, roleIds: string[]) {
  return requestClient.post('/v1/sys/user/bind-role', {
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
  return requestClient.post('/v1/sys/user/bind-dept', {
    deptId,
    userId,
  });
}

/**
 * 踢下线
 * @param id 用户ID
 */
async function kickOutUser(id: string) {
  return requestClient.post('/v1/sys/user/kick-out', { id });
}

export {
  bindUserDept,
  bindUserRole,
  createUser,
  deleteUser,
  getUserDetail,
  getUserList,
  kickOutUser,
  listRelatedRole,
  resetUserPassword,
  setUserStatus,
  updateUser,
};
