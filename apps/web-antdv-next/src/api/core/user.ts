import type { UserInfo } from '@vben/types';

import { preferences } from '@vben/preferences';

import type { GenderEnumValue, YesOrNoEnumValue } from '#/api/common';

import { requestClient } from '#/api/request';

// helium customization: 用户资料对接真实后端，并映射为前端 UserInfo
interface MyProfileDTO {
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
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const profile = await requestClient.post<MyProfileDTO>(
    '/v1/ucenter/profile/get',
  );
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
