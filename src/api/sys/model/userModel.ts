/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  username: string;
  password: string;
}

// Helio: 去除 RoleInfo 结构体

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
