import { defHttp } from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
import { SysParamApiResult, SysParamInsertOrUpdateForm } from './model/SysParamModel';

enum Api {
  REST = '/api/v1/sys/params',
}

/**
 * 系统参数-分页列表
 */
export const listSysParamApi = (queryForm: any, mode: ErrorMessageMode = 'modal') => {
  if (queryForm.timeRangePicker) {
    queryForm['beginAt'] = queryForm.timeRangePicker[0];
    queryForm['endAt'] = queryForm.timeRangePicker[1];
  }

  return defHttp.get<SysParamApiResult[]>(
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
 * 系统参数-详情
 */
export const retrieveSysParamApi = (id: string, mode: ErrorMessageMode = 'modal') => {
  return defHttp.get<SysParamApiResult>(
    {
      url: Api.REST + '/' + id,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 系统参数-新增
 */
export const createSysParamApi = (
  insertForm: SysParamInsertOrUpdateForm,
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
 * 系统参数-编辑
 */
export const updateSysParamApi = (
  id: string,
  updateForm: SysParamInsertOrUpdateForm,
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
 * 系统参数-删除
 */
export const deleteSysParamApi = (ids: string[], mode: ErrorMessageMode = 'modal') => {
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
