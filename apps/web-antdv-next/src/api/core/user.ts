import type { UserInfo } from '@vben/types';

import { preferences } from '@vben/preferences';

import { requestClient } from '#/api/request';

// adapt to helium: 用户资料对接自研后端，GET /user/info 改为 POST /admin/v1/ucenter/profile/get，并将 MyProfileDTO 映射为前端 UserInfo
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
    '/v1/ucenter/profile/get',
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
