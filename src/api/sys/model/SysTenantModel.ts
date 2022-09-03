/**
 * @model 系统租户
 */

/*
 ---- REQUEST ----
 */

/**
 * 系统租户-新增/编辑请求体
 */
export interface SysTenantInsertOrUpdateForm {
  /**
   * 租户名
   */
  tenantName: string;

  /**
   * 租户ID
   */
  tenantId: bigint;
}

/*
 ---- RESPONSE ----
 */

/**
 * 系统租户-通用响应体
 */
export type SysTenantApiResult = SysTenantInsertOrUpdateForm & {
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
