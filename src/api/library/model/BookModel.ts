/**
 * @model 书籍
 */

/*
 ---- REQUEST ----
 */

/**
 * 书籍-新增/编辑请求体
 */
export interface BookInsertOrUpdateForm {
  /**
   * 书籍名
   */
  title: string;

  /**
   * ISBN号
   */
  isbn: string;

  /**
   * 出版社
   */
  publisher: string;

  /**
   * 作者名
   */
  author: string;

  /**
   * 所属书籍类别ID
   */
  bookClassifiedId: string;

  /**
   * 单价
   */
  unitPrice: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 封面图片URL
   */
  coverImgUrl: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 总数量
   */
  totalQuantity: string;

  /**
   * 被借阅数量
   */
  borrowedQuantity: string;

  /**
   * 被损坏数量
   */
  damagedQuantity: string;

}

/*
 ---- RESPONSE ----
 */

/**
 * 书籍-通用响应体
 */
export type BookApiResult = BookInsertOrUpdateForm & {
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
