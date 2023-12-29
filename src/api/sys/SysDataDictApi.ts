import { defHttp } from '@/utils/http/axios';
import { SysDataDictApiResult, SysDataDictInsertOrUpdateForm } from './model/SysDataDictModel';

enum Api {
  REST = '/api/v1/sys/data-dicts',
}

/**
 * 数据字典-分页列表
 */
export const listSysDataDictApi = (queryForm: any) => {
  return defHttp.get<SysDataDictApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 数据字典-详情
 */
export const retrieveSysDataDictApi = (id: string) => {
  return defHttp.get<SysDataDictApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 数据字典-新增
 */
export const createSysDataDictApi = (insertForm: SysDataDictInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 数据字典-编辑
 */
export const updateSysDataDictApi = (id: string, updateForm: SysDataDictInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 数据字典-删除
 */
export const deleteSysDataDictApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};
