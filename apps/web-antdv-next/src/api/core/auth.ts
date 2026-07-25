import { baseRequestClient, requestClient } from '#/api/request';

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

  /** 登录接口返回值 */
  export interface LoginResult {
    /** token值 */
    token: string;
    /** 对应角色 */
    roles?: string[];
    /** 拥有权限 */
    permissions?: string[];
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    '/admin/v1/auth/password-login',
    data,
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/admin/v1/auth/logout');
}
