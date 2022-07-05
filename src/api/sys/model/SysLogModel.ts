/**
 * @model 后台操作日志
 */

/*
 ---- REQUEST ----
 */

/*
 ---- RESPONSE ----
 */

/**
 * 后台操作日志-通用响应体
 */
export type SysLogApiResult = {
  /**
   * 创建时刻
   */
  createdAt: string;

  /**
   * 用户账号
   */
  username: string;

  /**
   * 操作内容
   */
  operation: string;

  /**
   * IP地址
   */
  ip: string;

  /**
   * 状态
   */
  status: number;
};
