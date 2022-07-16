/**
 * @model 系统参数
 */

/*
 ---- REQUEST ----
 */

/**
 * 系统参数-新增/编辑请求体
 */
export interface SysParamInsertOrUpdateForm {
  /**
   * 键名
   */
  name: string;

  /**
   * 键值
   */
  value: string;

  /**
   * 描述
   */
  description: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 系统参数-通用响应体
 */
export type SysParamApiResult = SysParamInsertOrUpdateForm & {
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
