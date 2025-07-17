import { t } from '@/hooks/web/useI18n';
import { LAYOUT } from '../constant';
import { AppRouteRecordRaw } from '../types';

export const MY_PROFILE_FULL_PATH = '/my-profile';

// Helio: 增加"个人资料"页面
export const myProfileRoute: AppRouteRecordRaw = {
  path: '/',
  name: '',
  component: LAYOUT,
  meta: {
    title: '',
  },
  children: [
    {
      path: MY_PROFILE_FULL_PATH,
      name: t('layout.header.dropdownItemMyProfile'),
      component: () => import('@/views/sys/SysUser/my-profile/index.vue'),
      meta: {
        title: t('layout.header.dropdownItemMyProfile'),
      },
    },
  ],
}
