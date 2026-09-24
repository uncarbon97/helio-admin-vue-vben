// 文件管理
import type { PageParam, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

export namespace FileMetaApi {
  /** 列表查询条件 */
  export interface ListQuery {
    /** 分页参数 */
    pageParam: PageParam;
    /** 时间区间起 */
    beginAt?: string;
    /** 时间区间止 */
    endAt?: string;
    /** 存储点编码 */
    storageCode?: string;
    /** 扩展名 */
    extendName?: string;
    /** 文件主分类 */
    category?: string;
  }

  /** 值对象 */
  export interface FileMetaDTO {
    id: string;
    createdAt: string;
    updatedAt: string;
    /** 原始存储点ID */
    storageId: string;
    /** 存储点编码 */
    storageCode: string;
    /** 存储点主目录路径 */
    storageBasePath: string;
    /** 子目录路径 */
    subDirPath: string;
    /** 存储文件名 */
    storageFilename: string;
    /** 原始文件名 */
    originalFilename: string;
    /** 扩展名 */
    extendName: string;
    /** 文件大小（字节） */
    fileSize: number;
    /** SHA256 */
    digestSha256: string;
    /** 文件主分类 */
    category: string;
    /** 对象存储直链 */
    directUrl: string;
  }
}

const API_PATH = '/v1/file/meta';
/**
 * 分页查询
 */
async function getFileMetaList(data: FileMetaApi.ListQuery) {
  return requestClient.post<PageResult<FileMetaApi.FileMetaDTO>>(
    `${API_PATH}/list`,
    data,
  );
}

/**
 * 详情
 * @param id ID
 */
async function getFileMetaDetail(id: string) {
  return requestClient.post<FileMetaApi.FileMetaDTO>(`${API_PATH}/detail`, {
    id,
  });
}

/**
 * 删除
 * @param id 文件ID
 */
async function deleteFileMeta(id: string) {
  return requestClient.post(`${API_PATH}/delete`, { id });
}

export { deleteFileMeta, getFileMetaDetail, getFileMetaList };
