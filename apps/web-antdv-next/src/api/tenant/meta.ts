import type { EnabledStatusEnumValue, PageParam, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

export namespace TenantMetaApi {
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 租户编码(关键词) */
    code?: string;
    /** 租户名称(关键词) */
    name?: string;
    /** 状态 */
    status?: EnabledStatusEnumValue;
  }

  /** 新增请求表单（含租户管理员账号初始化） */
  export interface CreateRequest {
    /** 租户编码 */
    code: string;
    /** 租户名称 */
    name: string;
    /** 租户管理员账号 */
    tenantAdminPin: string;
    /** 租户管理员初始密码 */
    tenantAdminPwd: string;
    /** 租户管理员邮箱 */
    tenantAdminEmail: string;
    /** 租户管理员手机号 */
    tenantAdminPhoneNo: string;
    /** 所属租户套餐ID */
    packageId?: string;
  }

  /** 修改请求表单 */
  export interface UpdateRequest {
    /** 主键ID */
    id: string;
    /** 租户名称 */
    name: string;
    /** 所属租户套餐ID */
    packageId?: string;
    /** 状态 */
    status: EnabledStatusEnumValue;
  }

  /** 租户管理员用户资料 */
  export interface TenantUserBasicProfileDTO {
    pin: string;
    nickname: string;
    /** 性别（后端可能返回整数） */
    gender: number | string;
    email: string;
    phoneNo: string;
  }

  /** 值对象 */
  export interface TenantMetaDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    /** 租户编码 */
    code: string;
    /** 租户名称 */
    name: string;
    /** 状态 */
    status: EnabledStatusEnumValue;
    /** 租户管理员用户ID */
    adminUserId: string;
    /** 所属租户套餐ID */
    packageId: string;
    /** 租户管理员用户资料 */
    adminUserProfile: TenantUserBasicProfileDTO;
  }
}

/**
 * 分页查询
 */
async function getTenantMetaList(data: TenantMetaApi.ListQuery) {
  return requestClient.post<PageResult<TenantMetaApi.TenantMetaDTO>>(
    '/v1/tenant/list',
    data,
  );
}

/**
 * 详情
 * @param id ID
 */
async function getTenantMetaDetail(id: string) {
  return requestClient.post<TenantMetaApi.TenantMetaDTO>('/v1/tenant/detail', {
    id,
  });
}

/**
 * 新增
 * @param request 请求表单
 */
async function createTenant(request: TenantMetaApi.CreateRequest) {
  return requestClient.post('/v1/tenant/create', request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateTenant(request: TenantMetaApi.UpdateRequest) {
  return requestClient.post('/v1/tenant/update', request);
}

/**
 * 修改状态（启用/禁用）
 * @param id 租户ID
 * @param newStatus 新状态
 */
async function setTenantStatus(id: string, newStatus: EnabledStatusEnumValue) {
  return requestClient.post('/v1/tenant/set-status', {
    id,
    newStatus,
  });
}

/**
 * 删除
 * @param id 租户ID
 */
async function deleteTenant(id: string) {
  return requestClient.post('/v1/tenant/delete', { id });
}

export {
  createTenant,
  deleteTenant,
  getTenantMetaDetail,
  getTenantMetaList,
  setTenantStatus,
  updateTenant,
};
