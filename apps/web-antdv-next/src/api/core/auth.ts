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

  /** 登录页租户相关UI配置 */
  export interface LoginTenantUIConfig {
    /** 是否显示租户编码输入框 */
    showTenantCodeInputFlag?: boolean;
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
 * 获取登录挑战
 */
export async function getLoginChallengeApi() {
  return requestClient.post<AuthApi.LoginChallenge>(
    `${API_PATH}/login-challenge`,
  );
}

/**
 * 获取租户相关UI配置
 */
// helium customization: 对接后端“获取租户相关UI配置”（POST /v1/auth/tenant-ui-config），
// 登录页租户编码输入框等开关由后端下发，禁止前端本地硬编码
export async function getTenantUIConfigApi() {
  return requestClient.post<AuthApi.LoginTenantUIConfig>(
    `${API_PATH}/tenant-ui-config`,
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post(`${API_PATH}/logout`);
}
