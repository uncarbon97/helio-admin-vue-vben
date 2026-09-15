// adapt to helium: 文件存储点管理接口（后端 AdminFileStorageController）
import type { PageParam, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

/** 存储平台类型枚举（字符串值） */
export const PlatformTypeEnum = {
  /** 本地 */
  LOCAL: 'local',
  /** S3 兼容 */
  AMAZON_S3: 's3',
  /** S3-v2 兼容 */
  AMAZON_S3_V2: 's3-v2',
  /** 阿里云 OSS */
  ALIYUN_OSS: 'aliyun_oss',
} as const;

export type PlatformTypeEnumValue =
  (typeof PlatformTypeEnum)[keyof typeof PlatformTypeEnum];

/** 主存储点标识枚举（YesOrNoEnum，后端按整数输出） */
export const YesOrNoEnum = {
  /** 否 */
  NO: 0,
  /** 是 */
  YES: 1,
} as const;

export type YesOrNoEnumValue = (typeof YesOrNoEnum)[keyof typeof YesOrNoEnum];

export namespace FileStorageApi {
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 存储点编码(关键词) */
    code?: string;
    /** 存储点名称(关键词) */
    name?: string;
    /** 存储平台类型 */
    platformType?: PlatformTypeEnumValue;
    /** 主存储点标识 */
    primaryFlag?: YesOrNoEnumValue;
    /** 时间区间起 */
    beginAt?: string;
    /** 时间区间止 */
    endAt?: string;
  }

  /** 新增/修改请求表单 */
  export interface UpsertRequest {
    /** 主键ID（新增时不传） */
    id?: string;
    /** 存储点编码 */
    code: string;
    /** 存储点名称 */
    name: string;
    /** 存储平台类型 */
    platformType: PlatformTypeEnumValue;
    /** 配置属性 */
    settingBody: Record<string, any>;
    /** 主存储点标识 */
    primaryFlag: YesOrNoEnumValue;
  }

  /** 值对象 */
  export interface FileStorageDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    /** 存储点编码 */
    code: string;
    /** 存储点名称 */
    name: string;
    /** 存储平台类型 */
    platformType: PlatformTypeEnumValue;
    /** 配置属性 */
    settingBody: Record<string, any>;
    /** 主存储点标识 */
    primaryFlag: YesOrNoEnumValue;
  }

  /** 测试上传结果 */
  export interface TestUploadResult {
    /** 外显文件ID（Hashids） */
    outFileId: string;
    /** 存储文件名（含路径） */
    filename: string;
    /** 访问URL */
    url: string;
    /** 原始文件名 */
    originalFilename: string;
  }
}

/**
 * 分页查询
 */
async function getFileStorageList(data: FileStorageApi.ListQuery) {
  return requestClient.post<PageResult<FileStorageApi.FileStorageDTO>>(
    '/v1/file/storage/list',
    data,
  );
}

/**
 * 详情
 * @param id ID
 */
async function getFileStorageDetail(id: string) {
  return requestClient.post<FileStorageApi.FileStorageDTO>(
    '/v1/file/storage/detail',
    { id },
  );
}

/**
 * 新增
 * @param request 请求表单
 */
async function createFileStorage(request: FileStorageApi.UpsertRequest) {
  return requestClient.post('/v1/file/storage/create', request);
}

/**
 * 修改
 * @param request 请求表单
 */
async function updateFileStorage(request: FileStorageApi.UpsertRequest) {
  return requestClient.post('/v1/file/storage/update', request);
}

/**
 * 删除
 * @param id 存储点ID
 */
async function deleteFileStorage(id: string) {
  return requestClient.post('/v1/file/storage/delete', { id });
}

/**
 * adapt to helium: 测试上传（服务端生成测试文件，验证存储点可用性，支持非主存储点；需 file:storage:update 权限）
 * @param id 存储点ID
 */
async function testFileStorage(id: string) {
  return requestClient.post<FileStorageApi.TestUploadResult>(
    '/v1/file/storage/test-upload',
    { id },
  );
}

export {
  createFileStorage,
  deleteFileStorage,
  getFileStorageDetail,
  getFileStorageList,
  testFileStorage,
  updateFileStorage,
};
