/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  username: string;
  password: string;
  // Helio: 增加"记住我"参数
  rememberMe: boolean;
  // Helio: 登录验证码（可选）
  captchaId?: string;
  captchaAnswer?: string;
}

// Helio: 去除 RoleInfo 结构体

/**
 * 验证码接口返回体
 */
export interface CaptchaResultModel {
  /**
   * 验证码图片Base64
   */
  captchaImage: string;

  /**
   * 验证码唯一标识
   */
  captchaId: string;
}

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  // Helio: 字段全部替换
  tokenName: string;
  tokenValue: string;
  roles: string[];
  permissions: string[];
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoModel {
  // 用户id
  userId: string | number;
  // 用户名
  username: string;
  // 昵称
  // Helio: `realName` 替换为 `nickname`
  nickname: string;
  // 头像
  avatar: string;
  // 介绍
  desc?: string;
}
