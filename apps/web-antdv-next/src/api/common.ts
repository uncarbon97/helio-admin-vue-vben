// 通用业务契约
/** 启用禁用状态枚举 */
export type EnabledStatusEnum = 0 | 1;

/** 分页查询参数 */
export interface PageParam {
  /** 当前页码 */
  pageNum: number;
  /** 当前页大小 */
  pageSize: number;
}

/** 分页结果 */
export interface PageResult<T> {
  /** 当前页 */
  current: number;
  /** 记录 */
  records: T[];
  /** 当前页数量 */
  size: number;
  /** 总量 */
  total: number;
}
