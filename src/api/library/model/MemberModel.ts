/**
 * @model 会员
 */

/*
 ---- REQUEST ----
 */

/**
 * 会员-新增/编辑请求体
 */
export interface MemberInsertOrUpdateForm {
  /**
   * 学号/工号
   */
  username: string;

  /**
   * 真实姓名
   */
  realName: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 性别
   */
  gender: string;

  /**
   * 手机号
   */
  phoneNo: string;

  /**
   * 前端自定义-下拉框标题
   */
  title: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 会员-通用响应体
 */
export type MemberApiResult = MemberInsertOrUpdateForm & {
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
