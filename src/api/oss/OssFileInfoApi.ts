import { defHttp } from '@/utils/http/axios';
import { OssFileInfoApiResult } from './model/OssFileInfoModel';
import { getToken } from '@/utils/auth';
import { getAppEnvConfig } from '@/utils/env';

enum Api {
  REST = '/api/v1/oss/file/infos',
}

/**
 * 上传文件信息-分页列表
 */
export const listOssFileInfoApi = (queryForm: any) => {
  // 选择的是日期，补全时分秒部分
  if (queryForm.beginAt) {
    queryForm.beginAt += ' 00:00:00';
  }

  if (queryForm.endAt) {
    queryForm.endAt += ' 23:59:59';
  }

  return defHttp.get<OssFileInfoApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 上传文件信息-详情
 */
export const retrieveOssFileInfoApi = (id: string) => {
  return defHttp.get<OssFileInfoApiResult>({
    url: `${Api.REST}/${id}`,
  });
};

/**
 * 上传文件信息-删除
 */
export const deleteOssFileInfoApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 上传文件信息-下载文件
 */
export const downloadOssFileApi = (id: string) => {
  // 从缓存中取出 token；从环境变量中取出全局 BASE_URL
  const Authorization = getToken();
  const { VITE_GLOB_UPLOAD_URL } = getAppEnvConfig();
  // 拼串在新窗口打开
  window.open(`${VITE_GLOB_UPLOAD_URL}/${id}?Authorization=${Authorization}`);
};
