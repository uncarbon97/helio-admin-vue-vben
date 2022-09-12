/**
 * @model 后台用户
 */

/*
 ---- REQUEST ----
 */

/**
 * 后台用户-新增/编辑请求体
 */
export interface SysUserInsertOrUpdateForm {
  /**
   * 账号
   */
  pin: string;

  /**
   * 密码
   */
  pwd: string;

  /**
   * 昵称
   */
  nickname: string;

  /**
   * 状态(0=禁用 1=启用)
   */
  status: string;

  /**
   * 性别
   */
  gender: string;

  /**
   * 邮箱
   */
  email: string;

  /**
   * 手机号
   */
  phoneNo: string;

  /**
   * 最后登录时刻
   */
  lastLoginAt: string;
}

/**
 * 后台用户-修改当前用户密码请求体
 */
export interface SysUserUpdatePasswordForm {
  /**
   * 原密码
   */
  oldPassword: string;

  /**
   * 新密码
   */
  newPassword: string;

  /**
   * 确认新密码
   */
  confirmNewPassword: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 后台用户-通用响应体
 */
export type SysUserApiResult = SysUserInsertOrUpdateForm & {
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
