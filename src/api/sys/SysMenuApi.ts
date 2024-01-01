import { defHttp } from '@/utils/http/axios';
import { SysMenuApiResult, SysMenuInsertOrUpdateForm } from './model/SysMenuModel';
import { menu2Tree } from '@/api/sys/menu';
import { RouteItem } from '@/api/sys/model/menuModel';

enum Api {
  REST = '/api/v1/sys/menus',
}

/**
 * 取所有菜单
 */
export const listAllMenuApi = async () => {
  return await defHttp.get<RouteItem[]>({ url: `${Api.REST}/all` });
};

/**
 * 后台菜单-分页列表
 */
export const listSysMenuApi = async () => {
  const res = await defHttp.get<SysMenuApiResult[]>({
    url: Api.REST,
    // 没有入参
  });
  return menu2Tree(res);
};

/**
 * 后台菜单-详情
 */
export const retrieveSysMenuApi = (id: string) => {
  return defHttp.get<SysMenuApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 后台菜单-新增
 */
export const createSysMenuApi = (insertForm: SysMenuInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 后台菜单-编辑
 */
export const updateSysMenuApi = (id: string, updateForm: SysMenuInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 后台菜单-删除
 */
export const deleteSysMenuApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};
