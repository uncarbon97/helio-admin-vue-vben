import { defHttp } from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
import { SysDataDictApiResult, SysDataDictInsertOrUpdateForm } from './model/SysDataDictModel';

enum Api {
  REST = '/api/v1/sys/dataDicts',
}

/**
 * 数据字典-分页列表
 */
export const listSysDataDictApi = (queryForm: any, mode: ErrorMessageMode = 'modal') => {
  if (queryForm.timeRangePicker) {
    queryForm['beginAt'] = queryForm.timeRangePicker[0];
    queryForm['endAt'] = queryForm.timeRangePicker[1];
  }

  return defHttp.get<SysDataDictApiResult[]>(
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
 * 数据字典-详情
 */
export const retrieveSysDataDictApi = (id: string, mode: ErrorMessageMode = 'modal') => {
  return defHttp.get<SysDataDictApiResult>(
    {
      url: Api.REST + '/' + id,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 数据字典-新增
 */
export const createSysDataDictApi = (
  insertForm: SysDataDictInsertOrUpdateForm,
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
 * 数据字典-编辑
 */
export const updateSysDataDictApi = (
  id: string,
  updateForm: SysDataDictInsertOrUpdateForm,
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
 * 数据字典-删除
 */
export const deleteSysDataDictApi = (ids: string[], mode: ErrorMessageMode = 'modal') => {
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
