import { requestClient } from '#/api/request';

const API_PATH = '/v1/select-option';

/** 通用下拉选项 */
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
  const list = await requestClient.post<
    Array<{ id: string; name: string }>
  >(`${API_PATH}/sys/role`);
  return list.map((item) => ({ label: item.name, value: item.id }));
}

/** 部门下拉选项 */
export interface DeptSelectOptionItem {
  id: string;
  name: string;
  parentId?: string;
}

/**
 * 查询部门下拉选项
 */
async function getDeptSelectOptions() {
  return requestClient.post<DeptSelectOptionItem[]>(
    `${API_PATH}/sys/dept`,
  );
}

/** 部门树选项节点 */
export interface DeptOptionNode {
  id: string;
  name: string;
  children?: DeptOptionNode[];
}

/** 将扁平部门下拉选项按 parentId 构建为树 */
function buildDeptOptionTree(list: DeptSelectOptionItem[]): DeptOptionNode[] {
  const nodes = new Map<string, DeptOptionNode>();
  list.forEach((item) => {
    nodes.set(item.id, { id: item.id, name: item.name, children: [] });
  });

  const roots: DeptOptionNode[] = [];
  list.forEach((item) => {
    const node = nodes.get(item.id);
    const parent = nodes.get(item.parentId ?? '0');
    if (node && parent) {
      (parent.children ??= []).push(node);
    } else if (node) {
      roots.push(node);
    }
  });

  const toTree = (items: DeptOptionNode[]): DeptOptionNode[] =>
    items.map(({ children, ...rest }) => ({
      ...rest,
      children: children?.length ? toTree(children) : undefined,
    }));

  return toTree(roots);
}

/**
 * 查询文件存储点下拉选项
 */
async function getFileStorageSelectOptions() {
  return requestClient.post<SelectOptionItem[]>(
    `${API_PATH}/file/storage`,
  );
}

/**
 * 查询租户套餐下拉选项
 */
async function getTenantPackageSelectOptions() {
  return requestClient.post<SelectOptionItem[]>(
    `${API_PATH}/tenant/package`,
  );
}

export {
  buildDeptOptionTree,
  getDeptSelectOptions,
  getFileStorageSelectOptions,
  getRoleSelectOptions,
  getTenantPackageSelectOptions,
};
