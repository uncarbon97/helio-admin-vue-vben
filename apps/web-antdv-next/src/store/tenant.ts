import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import { notification } from 'antdv-next';
import { defineStore } from 'pinia';

import {
  enterTenantSwitch,
  exitTenantSwitch,
  getCurrentTenantContext,
  getSwitchableTenants,
  type TenantSwitchApi,
} from '#/api';
import { $t } from '#/locales';
import { resetRoutes } from '#/router';

import { useAuthStore } from './auth';

// helium customization: 租户切换状态 —— 对接后端 /v1/tenant-switch/*，供右上角租户切换控件消费
export const useTenantStore = defineStore('tenant', () => {
  const authStore = useAuthStore();
  const accessStore = useAccessStore();
  const router = useRouter();

  /** 当前会话租户信息 */
  const current = ref<TenantSwitchApi.TenantContextVO>();
  /** 可切换租户列表 */
  const switchable = ref<TenantSwitchApi.SwitchableTenant[]>([]);
  /** 是否已完成初始化拉取 */
  const initialized = ref(false);

  /**
   * 初始化：拉取当前视角 + 可切换租户列表（失败不阻塞页面，下次进入再试）
   */
  async function init() {
    if (initialized.value) {
      return;
    }
    try {
      await Promise.all([fetchCurrent(), fetchSwitchable()]);
      initialized.value = true;
    } catch {
      // 请求失败时保留未初始化状态，允许重试
    }
  }

  async function fetchCurrent() {
    current.value = await getCurrentTenantContext();
  }

  async function fetchSwitchable() {
    switchable.value = (await getSwitchableTenants()) ?? [];
  }

  /**
   * 切换视角后，后端已按目标租户重建权限快照；
   * 前端需重取用户信息，并强制路由/菜单在下次导航时按新租户重新生成
   */
  async function refreshSessionAfterSwitch() {
    let homePath: string | undefined;
    try {
      const userInfo = await authStore.fetchUserInfo();
      homePath = userInfo?.homePath;
    } catch {
      // 用户信息拉取失败不阻塞视角切换
    }
    accessStore.setIsAccessChecked(false);
    // 清掉旧租户视角下已注册的动态路由，避免残留可直达的失效路由
    resetRoutes();
    await router.replace(homePath || preferences.app.defaultHomePath);
  }

  /**
   * 切换至租户
   *
   * @param tenantCode 目标租户编码
   */
  async function switchTo(tenantCode: string) {
    const context = await enterTenantSwitch({ tenantCode });
    current.value = context;
    await refreshSessionAfterSwitch();
    notification.success({
      description: context.tenantName ?? context.tenantCode ?? tenantCode,
      duration: 3,
      title: $t('tenant.switch.switchSuccessTitle'),
    });
  }

  /**
   * 退出切换租户，回到默认视角
   */
  async function exitSwitch() {
    const context = await exitTenantSwitch();
    current.value = context;
    await refreshSessionAfterSwitch();
    notification.success({
      duration: 3,
      title: $t('tenant.switch.exitSuccessTitle'),
    });
  }

  function $reset() {
    current.value = undefined;
    switchable.value = [];
    initialized.value = false;
  }

  return {
    $reset,
    current,
    exitSwitch,
    fetchCurrent,
    fetchSwitchable,
    init,
    initialized,
    switchable,
    switchTo,
  };
});
