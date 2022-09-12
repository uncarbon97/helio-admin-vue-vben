/**
 * @model 后台角色
 */

/*
 ---- REQUEST ----
 */

/**
 * 后台角色-新增/编辑请求体
 */
export interface SysRoleInsertOrUpdateForm {
  /**
   * 名称
   */
  title: string;

  /**
   * 值
   */
  value: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 后台角色-通用响应体
 */
export type SysRoleApiResult = SysRoleInsertOrUpdateForm & {
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
