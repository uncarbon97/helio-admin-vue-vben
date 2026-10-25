import { requestClient } from '#/api/request';

// 后台管理UI功能开关配置接口，禁止前端本地硬编码开关常量
export namespace UiConfigApi {
  /** 登录页租户相关UI配置 */
  export interface LoginUIConfig {
    /** 是否显示租户编码输入框 */
    showTenantCodeInputFlag?: boolean;
  }

  /** 用户管理页「删除」按钮语义 */
  export type UserDeleteActionEnumValue = 'GLOBAL_DELETE' | 'TENANT_EXPEL';

  /** 用户管理相关UI配置 */
  export interface SysUserUIConfig {
    /** 是否显示用户优先模式功能入口（全局找人/租户加入移出） */
    showUserFirstFeaturesFlag?: boolean;
    /** 「删除」按钮语义：GLOBAL_DELETE=全局删除；TENANT_EXPEL=移出本租户 */
    userDeleteAction?: UserDeleteActionEnumValue;
  }
}

const API_PATH = '/v1/ui-config';

/**
 * 获取登录页UI配置（无需登录）
 */
export async function getLoginUIConfigApi() {
  return requestClient.post<UiConfigApi.LoginUIConfig>(
    `${API_PATH}/login`,
  );
}

/**
 * 获取用户管理页UI配置（需登录）
 */
export async function getSysUserUIConfigApi() {
  return requestClient.post<UiConfigApi.SysUserUIConfig>(
    `${API_PATH}/sys-user`,
  );
}
