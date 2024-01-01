import { defHttp } from '@/utils/http/axios';
import { SysTenantApiResult, SysTenantInsertOrUpdateForm } from './model/SysTenantModel';

enum Api {
  REST = '/api/v1/sys/tenants',
}

/**
 * 系统租户-分页列表
 */
export const listSysTenantApi = (queryForm: any) => {
  return defHttp.get<SysTenantApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 系统租户-详情
 */
export const retrieveSysTenantApi = (id: string) => {
  return defHttp.get<SysTenantApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 系统租户-新增
 */
export const createSysTenantApi = (insertForm: SysTenantInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 系统租户-编辑
 */
export const updateSysTenantApi = (id: string, updateForm: SysTenantInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 系统租户-删除
 */
export const deleteSysTenantApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};
