import type { PageParam, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

/** 登录日志类型枚举 */
export const LoginLogTypeEnum = {
  /** 密码登录 */
  PASSWORD_LOGIN: 1,
  /** 登出 */
  LOGOUT: 2,
} as const;

export type LoginLogTypeEnumValue =
  (typeof LoginLogTypeEnum)[keyof typeof LoginLogTypeEnum];

/** 日志结果状态枚举 */
export const LogResultStatusEnum = {
  /** 成功 */
  SUCCESS: 200,
  /** 失败 */
  FAILED: 400,
} as const;

export type LogResultStatusEnumValue =
  (typeof LogResultStatusEnum)[keyof typeof LogResultStatusEnum];

export namespace SysLoginLogApi {
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 用户账号(关键词) */
    userPin?: string;
    /** 结果状态 */
    resultStatus?: LogResultStatusEnumValue;
    /** 时间区间起 */
    beginAt?: string;
    /** 时间区间止 */
    endAt?: string;
  }

  /** 值对象 */
  export interface SysLoginLogDTO {
    // adapt to helium: 后端按 string 输出 long，用于兼容 JS 16 位上限
    /** 主键ID */
    id: string;
    /** 创建时刻 */
    createdAt: string;
    /** 登录日志类型 */
    loginLogType: LoginLogTypeEnumValue;
    /** 用户账号 */
    userPin: string;
    /** 用户ID */
    userId: string;
    /** 用户类型编码 */
    userTypeCode: string;
    /** 来源IP地址 */
    visitorIp: string;
    /** 来源浏览器+版本 */
    visitorBrowser: string;
    /** 来源操作系统+版本 */
    visitorOs: string;
    /** IP地址归属地 */
    visitorIpLocation: string;
    /** 结果状态 */
    resultStatus: LogResultStatusEnumValue;
    /** 失败原因文本 */
    failedMsg: null | string;
  }
}

/**
 * 分页查询
 */
async function getLoginLogList(data: SysLoginLogApi.ListQuery) {
  return requestClient.post<PageResult<SysLoginLogApi.SysLoginLogDTO>>(
    '/v1/sys/login-log/list',
    data,
  );
}

/**
 * 详情
 * @param id ID
 */
async function getLoginLogDetail(id: string) {
  return requestClient.post<SysLoginLogApi.SysLoginLogDTO>(
    '/v1/sys/login-log/detail',
    { id },
  );
}

export { getLoginLogDetail, getLoginLogList };
