import { defHttp } from '@/utils/http/axios';
import { SelectOptionsApiResult } from '@/api/select-options/model/SelectOptionsModel';

enum Api {
  REST = '/api/v1/select-options',
}

/**
 * 后台角色-下拉框数据
 */
export const sysRoleSelectOptionsApi = () => {
  return defHttp.get<SelectOptionsApiResult[]>({
    url: `${Api.REST}/roles`,
    params: {},
  });
};
