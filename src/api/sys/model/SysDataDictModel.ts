/**
 * @model 数据字典
 */

/*
 ---- REQUEST ----
 */

/**
 * 数据字典-新增/编辑请求体
 */
export interface SysDataDictInsertOrUpdateForm {
  /**
   * 驼峰式键名
   */
  camelCaseKey: string;
  /**
   * 下划线式键名
   */
  underCaseKey: string;
  /**
   * 帕斯卡式键名
   */
  pascalCaseKey: string;
  /**
   * 键值
   */
  value: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 单位
   */
  unit: string;
  /**
   * 取值范围
   */
  valueRange: string;
  /**
   * 别称键名
   */
  aliasKey: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 数据字典-通用响应体
 */
export type SysDataDictApiResult = SysDataDictInsertOrUpdateForm & {
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
