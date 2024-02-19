import { defHttp } from '@/utils/http/axios';
import { SelectOptionsApiResult } from '@/api/select-options/model/SelectOptionsModel';

enum Api {
  REST = '/api/v1/select-options',
}

/**
 * 后台角色下拉框
 */
export const sysRoleSelectOptionsApi = () => {
  return defHttp.get<SelectOptionsApiResult[]>({
    url: `${Api.REST}/roles`,
    params: {},
  });
};

/**
 * 部门下拉框（前端负责转为树状数据）
 */
export const sysDeptSelectOptionsApi = () => {
  return defHttp.get<SelectOptionsApiResult[]>({
    url: `${Api.REST}/depts`,
    params: {},
  });
};
