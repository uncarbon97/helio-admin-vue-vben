/**
 * @model 下拉框数据
 */

/*
 ---- REQUEST ----
 */

/*
 ---- RESPONSE ----
 */

/**
 * 下拉框数据-通用响应体
 */
export type SelectOptionsApiResult = {
  /**
   * 实体ID
   */
  id?: string;

  /**
   * 实体名称
   */
  name?: string;

  /**
   * 实体上级ID
   */
  parentId?: string;

  /**
   * 枚举值
   */
  value?: number;

  /**
   * 枚举标签
   */
  label?: string;
};
