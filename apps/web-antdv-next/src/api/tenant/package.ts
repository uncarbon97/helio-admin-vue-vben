import type { EnabledStatusEnum, PageParam, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

export namespace TenantPackageApi {
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 套餐编码(关键词) */
    code?: string;
    /** 套餐名称(关键词) */
    name?: string;
    /** 状态 */
    status?: EnabledStatusEnum;
  }

  /** 新增/修改请求表单 */
  export interface UpsertRequest {
    /** 主键ID（新增时不传） */
    id?: string;
    /** 套餐编码 */
    code: string;
    /** 套餐名称 */
    name: string;
    /** 状态 */
    status: EnabledStatusEnum;
    /** 套餐描述 */
    description: string;
  }

  /** 值对象 */
  export interface TenantPackageDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    /** 套餐编码 */
    code: string;
    /** 套餐名称 */
    name: string;
    /** 状态 */
    status: EnabledStatusEnum;
    /** 套餐描述 */
    description: string;
    /** 关联菜单Ids */
    menuIds: string[];
  }
}

/**
 * 分页查询
 */
async function getTenantPackageList(data: TenantPackageApi.ListQuery) {
  return requestClient.post<PageResult<TenantPackageApi.TenantPackageDTO>>(
    '/v1/tenant/package/list',
    data,
  );
}

/**
 * 详情
 * @param id ID
 */
async function getTenantPackageDetail(id: string) {
  return requestClient.post<TenantPackageApi.TenantPackageDTO>(
    '/v1/tenant/package/detail',
    { id },
  );
}

/**
 * 新增
 * @param request 请求表单
 */
async function createTenantPackage(
  request: TenantPackageApi.UpsertRequest,
) {
  return requestClient.post('/v1/tenant/package/create', request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateTenantPackage(
  request: TenantPackageApi.UpsertRequest,
) {
  return requestClient.post('/v1/tenant/package/update', request);
}

/**
 * 修改状态（启用/禁用）
 * @param id 套餐ID
 * @param newStatus 新状态
 */
async function setTenantPackageStatus(id: string, newStatus: EnabledStatusEnum) {
  return requestClient.post('/v1/tenant/package/set-status', {
    id,
    newStatus,
  });
}

/**
 * 删除
 * @param id 套餐ID
 */
async function deleteTenantPackage(id: string) {
  return requestClient.post('/v1/tenant/package/delete', { id });
}

/**
 * 绑定租户套餐菜单（授权）
 * @param id 套餐ID
 * @param menuIds 菜单IDs；为空则解除所有绑定
 */
async function bindTenantPackageMenu(id: string, menuIds: string[]) {
  return requestClient.post('/v1/tenant/package/bind-menu', {
    id,
    menuIds,
  });
}

export {
  bindTenantPackageMenu,
  createTenantPackage,
  deleteTenantPackage,
  getTenantPackageDetail,
  getTenantPackageList,
  setTenantPackageStatus,
  updateTenantPackage,
};
