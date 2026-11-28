import { useAccessStore } from '@vben/stores';

import { baseRequestClient, requestClient } from '#/api/request';

// helium customization: 登录/登出对接真实后端；入参改 pin/pwd（+tenantCode/captcha），返回 token/roles/permissions；移除 refreshTokenApi、getAccessCodesApi
export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    /** 账号 */
    pin: string;
    /** 密码 */
    pwd: string;
    /** 租户编码 */
    tenantCode?: string;
    /** 验证码唯一标识 */
    captchaId?: string;
    /** 验证码答案 */
    captchaAnswer?: string;
  }

  /** 登录挑战 */
  export interface LoginChallenge {
    /** 挑战类型（NONE=无挑战, OCR=图形验证码） */
    type: string;
    /** 验证码图片Base64（无 data: 前缀） */
    captchaImageEncoded?: string;
    /** 验证码唯一标识 */
    captchaId?: string;
    /** 验证码有效秒数 */
    validSeconds?: number;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    /** token值 */
    token: string;
    /** 对应角色 */
    roles?: string[];
    /** 拥有权限 */
    permissions?: string[];
  }

  /** 会话角色与权限返回值（登录后、切换租户后统一从这里重取） */
  export interface SessionPermissionResult {
    /** 角色编码列表 */
    roles?: string[];
    /** 权限名集合 */
    permissions?: string[];
  }
}

const API_PATH = '/v1/auth';

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    `${API_PATH}/password-login`,
    data,
  );
}

/**
 * 获取当前会话角色与权限
 * 登录后、切换租户后统一从这里重取
 */
export async function getPermissionsApi() {
  return requestClient.post<AuthApi.SessionPermissionResult>(
    `${API_PATH}/permissions`,
  );
}

/**
 * 获取登录挑战
 */
export async function getLoginChallengeApi() {
  return requestClient.post<AuthApi.LoginChallenge>(
    `${API_PATH}/login-challenge`,
  );
}

/**
 * 退出登录
 */
// helium customization: 登出请求补上 Authorization 头（baseRequestClient 无拦截器，不带头会被后端 401 拒绝）
export async function logoutApi() {
  const accessStore = useAccessStore();
  const token = accessStore.accessToken;
  return baseRequestClient.post(`${API_PATH}/logout`, undefined, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
