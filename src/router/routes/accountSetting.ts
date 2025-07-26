import { t } from '@/hooks/web/useI18n';
import { LAYOUT } from '../constant';
import { AppRouteRecordRaw } from '../types';

export const ACCOUNT_SETTING_FULL_PATH = '/me/account-setting';

// Helio: 增加"个人设置"页面
export const accountSettingRoute: AppRouteRecordRaw = {
  path: '/',
  name: '',
  component: LAYOUT,
  meta: {
    title: '',
  },
  children: [
    {
      path: ACCOUNT_SETTING_FULL_PATH,
      name: t('layout.header.dropdownItemAccountSetting'),
      component: () => import('@/views/sys/SysUser/account-setting/index.vue'),
      meta: {
        title: t('layout.header.dropdownItemAccountSetting'),
      },
    },
  ],
}
