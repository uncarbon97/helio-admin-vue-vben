/*
Helio: 下拉框类组件字段映射规则常量
 */

/**
 * TreeSelect 组件默认字段映射规则
 * https://www.antdv.com/components/tree-select/#api, fieldNames
 */
export const DEFAULT_TREE_SELECT_FIELD_NAMES = {
  // 组件children字段，对应数据源的children字段
  children: 'children',
  // 组件label字段，对应数据源的title字段
  label: 'title',
  // 组件value字段：对应数据源的id字段
  value: 'id',
};

/**
 * Select 组件默认字段映射规则
 * https://www.antdv.com/components/select/#api, fieldNames
 */
export const DEFAULT_SELECT_FIELD_NAMES = {
  // 组件label字段，对应数据源的title字段
  label: 'title',
  // 组件value字段：对应数据源的id字段
  value: 'id',
  // 组件options字段：对应数据源的options字段
  options: 'options',
};
