import { defHttp } from '@/utils/http/axios';
import {
  SysUserInsertOrUpdateForm,
  SysUserApiResult,
  SysUserUpdatePasswordForm,
} from './model/SysUserModel';

enum Api {
  REST = '/api/v1/sys/users',
}

/**
 * 后台用户-分页列表
 */
export const listSysUserApi = (queryForm: any) => {
  return defHttp.get<SysUserApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 后台用户-详情
 */
export const retrieveSysUserApi = (id: string) => {
  return defHttp.get<SysUserApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 后台用户-新增
 */
export const createSysUserApi = (insertForm: SysUserInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 后台用户-编辑
 */
export const updateSysUserApi = (id: string, updateForm: SysUserInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${id}`,
    params: updateForm,
  });
};

/**
 * 后台用户-删除
 */
export const deleteSysUserApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 后台用户-重置某用户密码
 * @param userId 用户ID
 * @param randomPassword 随机字符串新密码
 */
export const resetSysUserPasswordApi = async (userId: string, randomPassword: string) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${userId}/password`,
    params: {
      randomPassword,
    },
  });
};

/**
 * 后台用户-修改当前用户密码
 */
export const updateCurrentSysUserPasswordApi = (form: SysUserUpdatePasswordForm) => {
  return defHttp.post<void>({
    url: `${Api.REST}/me/password:update`,
    params: form,
  });
};

/**
 * 后台用户-绑定用户与角色关联关系
 */
export const bindRolesApi = (userId: string, roleIds: string[]) => {
  return defHttp.put<void>({
    url: `${Api.REST}/${userId}/roles`,
    params: {
      roleIds: roleIds,
    },
  });
};

/**
 * 后台用户-踢下线
 */
export const kickOutSysUserApi = (userId: string) => {
  return defHttp.post<void>({
    url: `${Api.REST}/${userId}:kick-out`,
  });
};

/**
 * 后台用户-取指定用户关联角色ID
 */
export const listRelatedRoleIdsApi = (userId: string) => {
  return defHttp.get<string[]>({
    url: `${Api.REST}/${userId}/roles`,
  });
};
