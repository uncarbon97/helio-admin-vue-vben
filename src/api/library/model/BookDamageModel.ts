/**
 * @model 书籍损坏记录
 */

/*
 ---- REQUEST ----
 */

/**
 * 书籍损坏记录-新增/编辑请求体
 */
export interface BookDamageInsertOrUpdateForm {
  /**
   * 书籍ID
   */
  bookId: string;

  /**
   * 书籍名
   */
  bookTitle: string;

  /**
   * 报损数量
   */
  quantity: string;

  /**
   * 备注
   */
  remark: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 书籍损坏记录-通用响应体
 */
export type BookDamageApiResult = BookDamageInsertOrUpdateForm & {
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
