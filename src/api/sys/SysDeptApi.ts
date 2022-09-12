import { defHttp } from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
import { SysDeptApiResult, SysDeptInsertOrUpdateForm } from './model/SysDeptModel';

enum Api {
  REST = '/api/v1/sys/depts',
}

/**
 * 部门-分页列表
 */
export const listSysDeptApi = (queryForm: any, mode: ErrorMessageMode = 'modal') => {
  if (queryForm.timeRangePicker) {
    queryForm['beginAt'] = queryForm.timeRangePicker[0];
    queryForm['endAt'] = queryForm.timeRangePicker[1];
  }

  queryForm['parentId'] = 0;

  return defHttp.get<SysDeptApiResult[]>(
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
 * 部门-详情
 */
export const retrieveSysDeptApi = (id: string, mode: ErrorMessageMode = 'modal') => {
  return defHttp.get<SysDeptApiResult>(
    {
      url: Api.REST + '/' + id,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 部门-新增
 */
export const createSysDeptApi = (
  insertForm: SysDeptInsertOrUpdateForm,
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
 * 部门-编辑
 */
export const updateSysDeptApi = (
  id: string,
  updateForm: SysDeptInsertOrUpdateForm,
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
 * 部门-删除
 */
export const deleteSysDeptApi = (ids: string[], mode: ErrorMessageMode = 'modal') => {
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
