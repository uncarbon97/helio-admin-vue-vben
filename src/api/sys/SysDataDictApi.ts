import { defHttp } from '@/utils/http/axios';
import {
  SysDataDictClassifiedApiResult,
  SysDataDictClassifiedInsertOrUpdateForm,
  SysDataDictItemApiResult,
  SysDataDictItemInsertOrUpdateForm,
} from './model/SysDataDictModel';

enum Api {
  REST = '/api/v1/sys/data-dict/classifieds',
}

/**
 * 数据字典分类-分页列表
 */
export const listSysDataDictClassifiedApi = (queryForm: any) => {
  return defHttp.get<SysDataDictClassifiedApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 数据字典分类-新增
 */
export const createSysDataDictClassifiedApi = (
  insertForm: SysDataDictClassifiedInsertOrUpdateForm,
) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 数据字典分类-编辑
 */
export const updateSysDataDictClassifiedApi = (
  id: string,
  updateForm: SysDataDictClassifiedInsertOrUpdateForm,
) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 数据字典分类-删除
 */
export const deleteSysDataDictClassifiedApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 数据字典项-分页列表
 */
export const listSysDataDictItemApi = (classifiedId: string, queryForm: any) => {
  return defHttp.get<SysDataDictItemApiResult[]>({
    url: `${Api.REST}/${classifiedId}/items`,
    params: queryForm,
  });
};

/**
 * 数据字典项-新增
 */
export const createSysDataDictItemApi = (
  classifiedId: string,
  insertForm: SysDataDictItemInsertOrUpdateForm,
) => {
  return defHttp.post<void>({
    url: `${Api.REST}/${classifiedId}/items`,
    params: insertForm,
  });
};

/**
 * 数据字典项-编辑
 */
export const updateSysDataDictItemApi = (
  classifiedId: string,
  id: string,
  updateForm: SysDataDictItemInsertOrUpdateForm,
) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${classifiedId}/items/${id}`,
    params: updateForm,
  });
};

/**
 * 数据字典项-删除
 */
export const deleteSysDataDictItemApi = (classifiedId: string, ids: string[]) => {
  return defHttp.delete<void>({
    url: `${Api.REST}/${classifiedId}/items`,
    params: {
      ids: ids,
    },
  });
};
