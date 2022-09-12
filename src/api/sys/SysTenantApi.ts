import { defHttp } from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
import { SysTenantApiResult, SysTenantInsertOrUpdateForm } from './model/SysTenantModel';

enum Api {
  REST = '/api/v1/sys/tenants',
}

/**
 * 系统租户-分页列表
 */
export const listSysTenantApi = (queryForm: any, mode: ErrorMessageMode = 'modal') => {
  if (queryForm.timeRangePicker) {
    queryForm['beginAt'] = queryForm.timeRangePicker[0];
    queryForm['endAt'] = queryForm.timeRangePicker[1];
  }

  return defHttp.get<SysTenantApiResult[]>(
    {
      url: Api.REST,
      params: queryForm,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 系统租户-详情
 */
export const retrieveSysTenantApi = (id: string, mode: ErrorMessageMode = 'modal') => {
  return defHttp.get<SysTenantApiResult>(
    {
      url: Api.REST + '/' + id,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 系统租户-新增
 */
export const createSysTenantApi = (
  insertForm: SysTenantInsertOrUpdateForm,
  mode: ErrorMessageMode = 'modal',
) => {
  return defHttp.post<void>(
    {
      url: Api.REST,
      params: insertForm,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 系统租户-编辑
 */
export const updateSysTenantApi = (
  id: string,
  updateForm: SysTenantInsertOrUpdateForm,
  mode: ErrorMessageMode = 'modal',
) => {
  return defHttp.put<void>(
    {
      url: Api.REST + '/' + id,
      params: updateForm,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 系统租户-删除
 */
export const deleteSysTenantApi = (ids: string[], mode: ErrorMessageMode = 'modal') => {
  return defHttp.delete<void>(
    {
      url: Api.REST,
      params: {
        ids: ids,
      },
    },
    {
      errorMessageMode: mode,
    },
  );
};
