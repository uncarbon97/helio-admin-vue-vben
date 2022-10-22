/**
 * @model 书籍类别
 */

/*
 ---- REQUEST ----
 */

/**
 * 书籍类别-新增/编辑请求体
 */
export interface BookClassifiedInsertOrUpdateForm {
  /**
   * 名称
   */
  title: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 父类别ID
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
 * 书籍类别-通用响应体
 */
export type BookClassifiedApiResult = BookClassifiedInsertOrUpdateForm & {
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
