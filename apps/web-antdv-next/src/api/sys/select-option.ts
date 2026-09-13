// adapt to helium: 通用下拉选项 API（契约见根目录 swagger.json，tag: 后台管理-下拉选择项）
import { requestClient } from '#/api/request';

/** 通用下拉选项项 */
export interface SelectOptionItem {
  /** 选项值 */
  value: string;
  /** 选项文案 */
  label: string;
}

/**
 * 查询角色下拉选项
 */
async function getRoleSelectOptions() {
  return requestClient.post<SelectOptionItem[]>(
    '/v1/select-option/sys/role',
  );
}

export { getRoleSelectOptions };
