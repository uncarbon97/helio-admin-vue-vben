import type { UserInfo } from '@vben/types';

import type { GenderEnumValue, YesOrNoEnumValue } from '#/api/common';

import { preferences } from '@vben/preferences';

import { requestClient } from '#/api/request';

// helium customization: 用户资料对接真实后端，并映射为前端 UserInfo
export interface MyProfileDTO {
  pin: string;
  nickname?: string;
  gender?: GenderEnumValue;
  email?: string;
  phoneNo?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  mustChangePassword?: YesOrNoEnumValue;
}

/**
 * 取当前用户资料（原始 DTO）
 */
export function getMyProfileApi() {
  return requestClient.post<MyProfileDTO>('/v1/ucenter/profile/get');
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const profile = await getMyProfileApi();
  return {
    avatar: profile.avatarUrl || preferences.app.defaultAvatar,
    desc: '',
    homePath: preferences.app.defaultHomePath,
    realName: profile.nickname || profile.pin,
    mustChangePassword: profile.mustChangePassword,
    roles: [] as string[],
    token: '',
    userId: profile.pin,
    username: profile.pin,
  } as UserInfo;
}

/**
 * 修改当前用户密码（成功后后端会使当前会话过期）
 */
export function updateMyPasswordApi(data: {
  confirmNeo: string;
  neo: string;
  old: string;
}) {
  return requestClient.post('/v1/ucenter/password/update', data);
}

/**
 * 修改当前用户资料
 */
export function updateMyProfileApi(data: {
  email: string;
  gender: GenderEnumValue;
  nickname: string;
  phoneNo: string;
}) {
  return requestClient.post('/v1/ucenter/profile/update', data);
}

// helium customization: 头像上传走通用文件上传接口，再把结果提交给用户中心
export interface FileUploadResultVO {
  /** 外显文件ID（Hashids） */
  outFileId: string;
  /** 存储文件名（含路径） */
  filename: string;
  /** 访问URL */
  url: string;
  /** 原始文件名 */
  originalFilename: string;
}

/**
 * 上传文件（登录即可），命中 SHA256 秒传
 */
export function uploadFileApi(file: File) {
  return requestClient.upload<FileUploadResultVO>('/file/upload', { file });
}

/**
 * 修改当前用户头像（需先上传文件拿到 FileUploadResultVO）
 */
export function updateMyAvatarApi(data: FileUploadResultVO) {
  return requestClient.post('/v1/ucenter/avatar/update', data);
}
