import type { PageParam, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

import type { LogResultStatusEnumValue } from './login-log';

export namespace SysOperateLogApi {
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 时间区间起 */
    beginAt?: string;
    /** 时间区间止 */
    endAt?: string;
    /** 业务类型 */
    bizType?: string;
    /** 行为 */
    behavior?: string;
    /** 业务号 */
    bizNo?: string;
    /** 用户ID */
    userId?: string;
    /** 结果状态 */
    resultStatus?: LogResultStatusEnumValue;
  }

  /** 值对象 */
  export interface SysOperateLogDTO {
    /** 主键ID */
    id: string;
    /** 创建时刻 */
    createdAt: string;
    /** 更新时刻 */
    updatedAt: string;
    /** 业务类型 */
    bizType: string;
    /** 行为 */
    behavior: string;
    /** 业务号 */
    bizNo: string;
    /** 操作内容 */
    operation: string;
    /** 额外业务信息 */
    bizExtra: string;
    /** 用户ID */
    userId: string;
    /** 用户类型编码 */
    userTypeCode: string;
    /** HTTP请求方法 */
    requestMethod: string;
    /** HTTP请求路径 */
    requestPath: string;
    /** 来源IP地址 */
    visitorIp: string;
    /** 来源UA */
    visitorUserAgent: string;
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
async function getOperateLogList(data: SysOperateLogApi.ListQuery) {
  return requestClient.post<PageResult<SysOperateLogApi.SysOperateLogDTO>>(
    '/v1/sys/operate-log/list',
    data,
  );
}

/**
 * 详情
 * @param id ID
 */
async function getOperateLogDetail(id: string) {
  return requestClient.post<SysOperateLogApi.SysOperateLogDTO>(
    '/v1/sys/operate-log/detail',
    { id },
  );
}

export { getOperateLogDetail, getOperateLogList };
