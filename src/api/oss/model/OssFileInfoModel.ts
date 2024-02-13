/**
 * @model 上传文件信息
 */

/*
 ---- REQUEST ----
 */

/**
 * 上传文件信息-新增/编辑请求体
 */
export interface OssFileInfoInsertOrUpdateForm {
  /**
   * 存储平台
   */
  storagePlatform: string;

  /**
   * 基础存储路径
   */
  storageBasePath: string;

  /**
   * 存储路径
   */
  storagePath: string;

  /**
   * 存储文件名
   */
  storageFilename: string;

  /**
   * 原始文件名
   */
  originalFilename: string;

  /**
   * 扩展名
   */
  extendName: string;

  /**
   * 文件大小
   */
  fileSize: string;

  /**
   * MD5
   */
  md5: string;

  /**
   * 文件类别
   */
  classified: string;

  /**
   * 对象存储直链
   */
  directUrl: string;
}

/*
 ---- RESPONSE ----
 */

/**
 * 上传文件信息-通用响应体
 */
export type OssFileInfoApiResult = OssFileInfoInsertOrUpdateForm & {
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
};
