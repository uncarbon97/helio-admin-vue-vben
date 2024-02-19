import { SelectOptionsApiResult } from '@/api/select-options/model/SelectOptionsModel';
import { ref } from 'vue';
import {
  sysDeptSelectOptionsApi,
  sysRoleSelectOptionsApi,
} from '@/api/select-options/SelectOptionsApi';
import { list2Tree } from '@/helio/converter/bizDataStructConverter';

/**
 * 后台角色下拉框
 */
export const useSysRoleSelectOptions = () => {
  const sysRoleSelectOptions = ref<SelectOptionsApiResult[]>([]);
  const fetchSysRoleSelectOptions = async () => {
    sysRoleSelectOptions.value = await sysRoleSelectOptionsApi();
  };

  return {
    sysRoleSelectOptions,
    fetchSysRoleSelectOptions,
  };
};

/**
 * 部门下拉框（前端负责转为树状数据）
 */
export const useSysDeptSelectOptions = () => {
  const sysDeptSelectOptions = ref<SelectOptionsApiResult[]>([]);
  const fetchSysDeptSelectOptions = async () => {
    sysDeptSelectOptions.value = list2Tree(await sysDeptSelectOptionsApi());
  };

  return {
    sysDeptSelectOptions,
    fetchSysDeptSelectOptions,
  };
};
