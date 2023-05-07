/**
 * @model 后台菜单
 */

/*
 ---- REQUEST ----
 */

/**
 * 后台菜单-新增/编辑请求体
 */
export interface SysMenuInsertOrUpdateForm {
  /**
   * 名称
   */
  title: string;

  /**
   * 上级菜单ID(根节点设置为0)
   */
  parentId: string;

  /**
   * 菜单类型(参考MenuTypeEnum)
   */
  type: number;

  /**
   * 路由地址
   */
  routeUrl: string;

  /**
   * 组件
   * Vue项目中`/@/views/`的子路径; `LAYOUT`为空页面
   */
  component: string;

  /**
   * 权限标识
   */
  permission: string;

  /**
   * 图标
   */
  icon: string;

  /**
   * 排序
   */
  sort: string;

  /**
   * 状态
   */
  status: number;
}

/*
 ---- RESPONSE ----
 */

/**
 * 后台菜单-通用响应体
 */
export type SysMenuApiResult = SysMenuInsertOrUpdateForm & {
  /**
   * 主键ID
   */
  id: string;

  /**
   * 创建时刻
   */
  createdAt: string;

  /**
   * 更新时刻
   */
  updatedAt: string;

  /**
   * 子级
   */
  children: SysMenuApiResult[];
};
