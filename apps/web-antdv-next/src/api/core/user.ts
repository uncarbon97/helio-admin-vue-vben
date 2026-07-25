import type { UserInfo } from '@vben/types';

import { preferences } from '@vben/preferences';

import { requestClient } from '#/api/request';

/** 后端 /admin/v1/ucenter/profile/get 返回结构 */
interface MyProfileDTO {
  pin: string;
  nickname?: string;
  gender?: string;
  email?: string;
  phoneNo?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  requireNewPwdFlag?: 'NO' | 'YES';
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  const profile = await requestClient.post<MyProfileDTO>(
    '/admin/v1/ucenter/profile/get',
  );
  return {
    avatar: profile.avatarUrl || preferences.app.defaultAvatar,
    desc: '',
    homePath: preferences.app.defaultHomePath,
    realName: profile.nickname || profile.pin,
    roles: [] as string[],
    token: '',
    userId: profile.pin,
    username: profile.pin,
  } as UserInfo;
}
