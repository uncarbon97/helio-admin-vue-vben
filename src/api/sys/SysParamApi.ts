import { defHttp } from '@/utils/http/axios';
import { SysParamApiResult, SysParamInsertOrUpdateForm } from './model/SysParamModel';

enum Api {
  REST = '/api/v1/sys/params',
}

/**
 * 系统参数-分页列表
 */
export const listSysParamApi = (queryForm: any) => {
  return defHttp.get<SysParamApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 系统参数-详情
 */
export const retrieveSysParamApi = (id: string) => {
  return defHttp.get<SysParamApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 系统参数-新增
 */
export const createSysParamApi = (insertForm: SysParamInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 系统参数-编辑
 */
export const updateSysParamApi = (id: string, updateForm: SysParamInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 系统参数-删除
 */
export const deleteSysParamApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};
