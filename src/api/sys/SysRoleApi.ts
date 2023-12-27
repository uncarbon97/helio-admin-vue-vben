import { defHttp } from '@/utils/http/axios';
import { SysRoleApiResult, SysRoleInsertOrUpdateForm } from './model/SysRoleModel';

enum Api {
  REST = '/api/v1/sys/roles',
}

/**
 * 后台角色-分页列表
 */
export const listSysRoleApi = (queryForm: any) => {
  return defHttp.get<SysRoleApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 后台角色-详情
 */
export const retrieveSysRoleApi = (id: string) => {
  return defHttp.get<SysRoleApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 后台角色-新增
 */
export const createSysRoleApi = (insertForm: SysRoleInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 后台角色-编辑
 */
export const updateSysRoleApi = (id: string, updateForm: SysRoleInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 后台角色-删除
 */
export const deleteSysRoleApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 后台角色-绑定角色与菜单关联关系
 */
export const bindMenusApi = (roleId: string, menuIds: string[]) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${roleId}/menus`,
    params: {
      menuIds: menuIds,
    },
  });
};
