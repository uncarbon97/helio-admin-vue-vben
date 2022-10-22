/**
 * @model 书籍借阅记录
 */

/*
 ---- REQUEST ----
 */

/**
 * 书籍借阅记录-新增/编辑请求体
 */
export interface BookBorrowingInsertOrUpdateForm {
  /**
   * 会员ID
   */
  memberId: string;

  /**
   * 会员学号/工号
   */
  memberUsername: string;

  /**
   * 会员真实姓名
   */
  memberRealName: string;

  /**
   * 书籍ID
   */
  bookId: string;

  /**
   * 书籍名
   */
  bookTitle: string;

  /**
   * 书籍ISBN号
   */
  bookIsbn: string;

  /**
   * 借阅数量
   */
  quantity: string;

  /**
   * 借阅时间
   */
  borrowAt: string;

  /**
   * 借阅时长(天)
   */
  borrowDuration: string;

  /**
   * 约定归还时间
   */
  appointedReturnAt: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 书籍借阅记录-通用响应体
 */
export type BookBorrowingApiResult = BookBorrowingInsertOrUpdateForm & {
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
