// 通用业务契约
/**
 * 启用禁用状态枚举（后端 EnabledStatusEnum，BaseEnum<Integer> 按整数输出）
 * 跨领域复用：租户、套餐、菜单等
 */
export const EnabledStatusEnum = {
  /** 禁用 */
  DISABLED: 0,
  /** 启用 */
  ENABLED: 1,
} as const;

export type EnabledStatusEnumValue = (typeof EnabledStatusEnum)[keyof typeof EnabledStatusEnum];

/**
 * 是否枚举（后端框架级 YesOrNoEnum，BaseEnum<Integer> 按整数输出）
 * 跨领域复用：文件存储点主标识、用户首登改密标记等
 */
export const YesOrNoEnum = {
  /** 否 */
  NO: 0,
  /** 是 */
  YES: 1,
} as const;

export type YesOrNoEnumValue = (typeof YesOrNoEnum)[keyof typeof YesOrNoEnum];

/**
 * 性别枚举（后端框架级 GenderEnum，BaseEnum<Integer> 按整数输出）
 * 跨领域复用：系统用户、个人资料等
 */
export const GenderEnum = {
  /** 未知 */
  UNKNOWN: 0,
  /** 男 */
  MALE: 1,
  /** 女 */
  FEMALE: 2,
} as const;

export type GenderEnumValue = (typeof GenderEnum)[keyof typeof GenderEnum];

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
