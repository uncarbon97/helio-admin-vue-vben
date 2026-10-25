import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'antdv-next';
import { defineStore } from 'pinia';

import { getPermissionsApi, getUserInfoApi, loginApi, logoutApi, YesOrNoEnum } from '#/api';
import { $t } from '#/locales';
import { CHANGE_PWD_PATH } from '#/router/constants';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      // helium customization: 消费后端登录返回的 token；角色/权限码登录后从 /v1/auth/permissions 统一重取（与切换租户后同源）；用户资料拉取改为容错（失败不阻塞登录）
      const { token } = await loginApi({
        captchaAnswer: params.captchaAnswer,
        captchaId: params.captchaId,
        pin: params.pin ?? params.username,
        pwd: params.pwd ?? params.password,
        tenantCode: params.tenantCode,
      });

      // 如果成功获取到 token
      if (token) {
        accessStore.setAccessToken(token);

        // 拉取用户资料，失败不阻塞登录
        try {
          userInfo = await fetchUserInfo();
        } catch {
          userInfo = null;
        }

        // helium customization: 放在 fetchUserInfo 之后，避免被 setUserInfo 内部的 setUserRoles 覆盖；拉取失败不阻塞登录
        try {
          await refreshSessionPermissions();
        } catch {
          // 忽略：沿用旧权限码，下次登录/切换租户时重试
        }

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          // helium customization: pwdMustChange 时登录后直达强制修改密码页
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo?.pwdMustChange === YesOrNoEnum.YES
                  ? CHANGE_PWD_PATH
                  : userInfo?.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            title: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    // helium customization: 401 触发的 doReAuthenticate 会先清 token 再调 logout；
    // 无 token 时跳过登出接口，避免 401→logout→401 无限递归
    if (accessStore.accessToken) {
      try {
        await logoutApi();
      } catch {
        // 不做任何处理
      }
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /**
   * 重取当前会话角色与权限码
   * 登录后、切换租户后统一入口，保持单一来源
   */
  async function refreshSessionPermissions() {
    const { roles = [], permissions = [] } =
      (await getPermissionsApi()) ?? {};
    accessStore.setAccessCodes(permissions);
    userStore.setUserRoles(roles);
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    refreshSessionPermissions,
  };
});
