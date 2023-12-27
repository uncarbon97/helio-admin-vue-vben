import { defHttp } from '@/utils/http/axios';
import { SysDeptApiResult, SysDeptInsertOrUpdateForm } from './model/SysDeptModel';
import { list2Tree } from '@/helio/converter/bizDataStructConverter';

enum Api {
  REST = '/api/v1/sys/depts',
}

/**
 * 部门-分页列表
 */
export const listSysDeptApi = async () => {
  const res = await defHttp.get<SysDeptApiResult[]>({
    url: Api.REST,
    // 没有入参
  });
  return list2Tree(res);
};

/**
 * 部门-详情
 */
export const retrieveSysDeptApi = (id: string) => {
  return defHttp.get<SysDeptApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 部门-新增
 */
export const createSysDeptApi = (insertForm: SysDeptInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 部门-编辑
 */
export const updateSysDeptApi = (id: string, updateForm: SysDeptInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 部门-删除
 */
export const deleteSysDeptApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};
