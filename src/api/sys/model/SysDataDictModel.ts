/**
 * @model 数据字典
 */

/*
 ---- REQUEST ----
 */

/**
 * 数据字典分类-新增/编辑请求体
 */
export interface SysDataDictClassifiedInsertOrUpdateForm {
  /**
   * 分类编码
   */
  code: string;

  /**
   * 分类名称
   */
  name: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 分类描述
   */
  description: string;
}

/**
 * 数据字典项-新增/编辑请求体
 */
export interface SysDataDictItemInsertOrUpdateForm {
  /**
   * 所属分类ID
   */
  classifiedId: string;

  /**
   * 字典项编码
   */
  code: string;

  /**
   * 字典项标签
   */
  label: string;

  /**
   * 字典项值
   */
  value: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 排序
   */
  sort: string;

  /**
   * 描述
   */
  description: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 数据字典分类-通用响应体
 */
export type SysDataDictClassifiedApiResult = SysDataDictClassifiedInsertOrUpdateForm & {
  /**
   * 主键ID
   */
  id: string;

  /**
   * 创建时刻
   */
  createdAt: string;

  /**
   * 更新时刻
   */
  updatedAt: string;
};

/**
 * 数据字典项-通用响应体
 */
export type SysDataDictItemApiResult = SysDataDictItemInsertOrUpdateForm & {
  /**
   * 主键ID
   */
  id: string;

  /**
   * 创建时刻
   */
  createdAt: string;

  /**
   * 更新时刻
   */
  updatedAt: string;
};
