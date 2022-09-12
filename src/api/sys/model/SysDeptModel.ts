/**
 * @model 部门
 */

/*
 ---- REQUEST ----
 */

/**
 * 部门-新增/编辑请求体
 */
export interface SysDeptInsertOrUpdateForm {
  /**
   * 名称
   */
  title: string;

  /**
   * 上级ID(根节点设置为0)
   */
  parentId: string;

  /**
   * 排序
   */
  sort: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 部门-通用响应体
 */
export type SysDeptApiResult = SysDeptInsertOrUpdateForm & {
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
