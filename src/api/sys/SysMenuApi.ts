import { defHttp } from '/@/utils/http/axios';
import { RouteItem, SysMenuApiResult, SysMenuInsertOrUpdateForm } from './model/SysMenuModel';
import { ErrorMessageMode } from '/#/axios';
import { menu2Tree } from '/@/api/sys/menu';

enum Api {
  LIST_ALL_MENU = '/api/v1/sys/menus/all',
  REST = '/api/v1/sys/menus',
}

/**
 * 取所有菜单
 */
export const listAllMenu = async () => {
  const res = await defHttp.get<RouteItem[]>({ url: Api.LIST_ALL_MENU });
  return menu2Tree(res);
};

/**
 * 后台菜单-分页列表
 */
export const listSysMenuApi = async (queryForm: any, mode: ErrorMessageMode = 'modal') => {
  if (queryForm.timeRangePicker) {
    queryForm['beginAt'] = queryForm.timeRangePicker[0];
    queryForm['endAt'] = queryForm.timeRangePicker[1];
  }

  const res = await defHttp.get<SysMenuApiResult[]>(
    {
      url: Api.REST,
      params: queryForm,
    },
    {
      errorMessageMode: mode,
    },
  );
  return menu2Tree(res);
};

/**
 * 后台菜单-详情
 */
export const retrieveSysMenuApi = (id: string, mode: ErrorMessageMode = 'modal') => {
  return defHttp.get<SysMenuApiResult>(
    {
      url: Api.REST + '/' + id,
    },
    {
      errorMessageMode: mode,
    },
  );
};

/**
 * 后台菜单-新增
 */
export const createSysMenuApi = (
  insertForm: SysMenuInsertOrUpdateForm,
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
 * 后台菜单-编辑
 */
export const updateSysMenuApi = (
  id: string,
  updateForm: SysMenuInsertOrUpdateForm,
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
 * 后台菜单-删除
 */
export const deleteSysMenuApi = (ids: string[], mode: ErrorMessageMode = 'modal') => {
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
