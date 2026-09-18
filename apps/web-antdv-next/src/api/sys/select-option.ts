import { requestClient } from '#/api/request';

/** 通用下拉选项项 */
export interface SelectOptionItem {
  /** 选项值 */
  value: string;
  /** 选项文案 */
  label: string;
  /** 文件存储点编码（仅文件存储点下拉时返回） */
  storageCode?: string;
}

/**
 * 查询角色下拉选项
 */
async function getRoleSelectOptions() {
  return requestClient.post<SelectOptionItem[]>('/v1/select-option/sys/role');
}

/** 部门下拉选项项（后端按 parentId=0 或缺失视为根） */
export interface DeptSelectOptionItem {
  id: string;
  name: string;
  parentId?: string;
}

/**
 * 查询部门下拉选项（扁平列表，含 parentId；后端按权限过滤可见范围）
 */
async function getDeptSelectOptions() {
  return requestClient.post<DeptSelectOptionItem[]>(
    '/v1/select-option/sys/dept',
  );
}

/**
 * 查询文件存储点下拉选项
 * value 为存储点ID，storageCode 为存储点编码（按编码筛选时取 storageCode 作为选项值）
 */
async function getFileStorageSelectOptions() {
  return requestClient.post<SelectOptionItem[]>(
    '/v1/select-option/file/storage',
  );
}

/**
 * 查询租户套餐下拉选项
 * value 为套餐ID，label 为套餐名称
 */
async function getTenantPackageSelectOptions() {
  return requestClient.post<SelectOptionItem[]>(
    '/v1/select-option/tenant/package',
  );
}

export {
  getDeptSelectOptions,
  getFileStorageSelectOptions,
  getRoleSelectOptions,
  getTenantPackageSelectOptions,
};
