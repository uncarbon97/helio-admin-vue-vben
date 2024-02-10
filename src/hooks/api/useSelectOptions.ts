import { SelectOptionsApiResult } from '@/api/select-options/model/SelectOptionsModel';
import { ref } from 'vue';
import { sysRoleSelectOptionsApi } from '@/api/select-options/SelectOptionsApi';

/**
 * 角色下拉框数据
 */
export const useSysRoleSelectOptions = () => {
  const sysRoleSelectOptions = ref<SelectOptionsApiResult[]>([]);
  const getSysRoleSelectOptions = async () => {
    sysRoleSelectOptions.value = await sysRoleSelectOptionsApi();
  };

  return {
    sysRoleSelectOptions,
    getSysRoleSelectOptions,
  };
};
