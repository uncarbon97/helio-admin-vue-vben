import { requestClient } from '#/api/request';

// helium customization: 租户切换 —— 对接后端 AdminTenantSwitchController（POST /v1/tenant-switch/*），
// 供登录后右上角租户切换控件使用
export namespace TenantSwitchApi {
  /** 可切换租户项（后端 TenantContext） */
  export interface SwitchableTenant {
    /** 租户ID（后端 long 转 string，兼容JS精度） */
    tenantId: string;
    /** 租户编码 */
    tenantCode: string;
    /** 租户名称 */
    tenantName: string;
  }

  /** 当前会话租户信息 */
  export interface TenantContextVO {
    /** 当前生效租户编码；null=平台视角或个人空间 */
    tenantCode?: string;
    /** 当前生效租户名称；null=平台视角或个人空间 */
    tenantName?: string;
    /** 是否为平台视角（超级管理员未切换租户） */
    firstPartyView?: boolean;
    /** 当前会话是否处于切换后的租户视角 */
    switched?: boolean;
  }
}

const API_PATH = '/v1/tenant-switch';

/**
 * 可切换租户列表
 */
export async function getSwitchableTenants() {
  return requestClient.post<TenantSwitchApi.SwitchableTenant[]>(
    `${API_PATH}/switchable`,
  );
}

/**
 * 切换至租户
 *
 * @param data 目标租户编码
 */
export async function enterTenantSwitch(data: { tenantCode: string }) {
  return requestClient.post<TenantSwitchApi.TenantContextVO>(
    `${API_PATH}/enter`,
    data,
  );
}

/**
 * 退出切换租户，回到默认视角
 */
export async function exitTenantSwitch() {
  return requestClient.post<TenantSwitchApi.TenantContextVO>(
    `${API_PATH}/exit`,
  );
}

/**
 * 当前会话租户信息
 */
export async function getCurrentTenantContext() {
  return requestClient.post<TenantSwitchApi.TenantContextVO>(
    `${API_PATH}/current`,
  );
}
