import type { PageParam, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

/**
 * 字典状态枚举（后端 DictStatusEnum，BaseEnum<Integer> 按整数输出）
 * 分类与字典项通用；「过时」用于标记存量兼容数据
 */
export const DictStatusEnum = {
  /** 禁用 */
  DISABLED: 0,
  /** 启用 */
  ENABLED: 1,
  /** 过时 */
  DEPRECATED: 2,
} as const;

export type DictStatusEnumValue =
  (typeof DictStatusEnum)[keyof typeof DictStatusEnum];

export namespace SysDictApi {
  /** 分类/内置字典列表查询条件（两个接口查询结构相同） */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 字典编码(关键词) */
    code?: string;
    /** 字典名称(关键词) */
    name?: string;
  }

  /** 字典项列表查询条件（后端仅支持按分类过滤） */
  export interface ItemListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 所属分类ID */
    categoryId: string;
  }

  /** 字典分类新增/修改请求表单 */
  export interface CategoryUpsertRequest {
    /** 主键ID（新增时不传） */
    id?: string;
    /** 字典编码 */
    code: string;
    /** 字典名称 */
    name: string;
    /** 状态 */
    status: DictStatusEnumValue;
    /** 字典描述 */
    description?: string;
  }

  /** 字典项新增/修改请求表单 */
  export interface ItemUpsertRequest {
    /** 主键ID（新增时不传） */
    id?: string;
    /** 所属分类ID */
    categoryId: string;
    /** 字典项编码 */
    code: string;
    /** 字典项值 */
    value: string;
    /** 字典项标签 */
    label: string;
    /** 状态 */
    status: DictStatusEnumValue;
    /** 排序 */
    sort: number;
    /** 字典项描述 */
    description?: string;
  }

  /** 字典分类值对象 */
  export interface CategoryDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    /** 字典编码 */
    code: string;
    /** 字典名称 */
    name: string;
    /** 状态 */
    status: DictStatusEnumValue;
    /** 字典描述 */
    description?: string;
  }

  /** 字典项值对象 */
  export interface ItemDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    /** 所属分类ID */
    categoryId: string;
    /** 字典项编码 */
    code: string;
    /** 字典项值 */
    value: string;
    /** 字典项标签 */
    label: string;
    /** 状态 */
    status: DictStatusEnumValue;
    /** 排序 */
    sort: number;
    /** 字典项描述 */
    description?: string;
  }

  /**
   * 内置字典值对象（由 @EnumDict 枚举生成，只读）
   * 无 id / 状态字段，字典项内嵌返回
   */
  export interface BuiltinDTO {
    /** 字典编码 */
    code: string;
    /** 字典名称 */
    name: string;
    /** 字典描述 */
    description?: string;
    /** 字典项集合 */
    items: ItemDTO[];
  }
}

/**
 * 分页查询字典分类
 */
async function getDictCategoryList(data: SysDictApi.ListQuery) {
  return requestClient.post<PageResult<SysDictApi.CategoryDTO>>(
    '/v1/sys/dict/category/list',
    data,
  );
}

/**
 * 新增字典分类
 * @param request 请求表单
 */
async function createDictCategory(request: SysDictApi.CategoryUpsertRequest) {
  return requestClient.post('/v1/sys/dict/category/create', request);
}

/**
 * 修改字典分类
 * @param request 请求表单
 */
async function updateDictCategory(request: SysDictApi.CategoryUpsertRequest) {
  return requestClient.post('/v1/sys/dict/category/update', request);
}

/**
 * 删除字典分类
 * @param id 字典分类ID
 */
async function deleteDictCategory(id: string) {
  return requestClient.post('/v1/sys/dict/category/delete', { id });
}

/**
 * 分页查询字典项
 */
async function getDictItemList(data: SysDictApi.ItemListQuery) {
  return requestClient.post<PageResult<SysDictApi.ItemDTO>>(
    '/v1/sys/dict/item/list',
    data,
  );
}

/**
 * 新增字典项
 * @param request 请求表单
 */
async function createDictItem(request: SysDictApi.ItemUpsertRequest) {
  return requestClient.post('/v1/sys/dict/item/create', request);
}

/**
 * 修改字典项
 * @param request 请求表单
 */
async function updateDictItem(request: SysDictApi.ItemUpsertRequest) {
  return requestClient.post('/v1/sys/dict/item/update', request);
}

/**
 * 删除字典项
 * @param id 字典项ID
 */
async function deleteDictItem(id: string) {
  return requestClient.post('/v1/sys/dict/item/delete', { id });
}

/**
 * 分页查询内置字典分类（@EnumDict 枚举生成，只读）
 */
async function getDictBuiltinList(data: SysDictApi.ListQuery) {
  return requestClient.post<PageResult<SysDictApi.BuiltinDTO>>(
    '/v1/sys/dict/builtin/list',
    data,
  );
}

export {
  createDictCategory,
  createDictItem,
  deleteDictCategory,
  deleteDictItem,
  getDictBuiltinList,
  getDictCategoryList,
  getDictItemList,
  updateDictCategory,
  updateDictItem,
};
