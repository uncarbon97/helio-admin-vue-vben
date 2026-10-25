import type { TenantSwitchApi } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccessStore, useTabbarStore } from '@vben/stores';

import { defineStore } from 'pinia';

import {
  enterTenantSwitch,
  exitTenantSwitch,
  getCurrentTenantContext,
  getSwitchableTenants,
} from '#/api';
import { useAuthStore } from './auth';

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
    // 无 token 时（如登出中）不发起请求，避免必然 401
    if (initialized.value || !accessStore.accessToken) {
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
   * 前端重取角色/权限码（落持久化，供重载后使用），再整页重载清掉旧视角的
   * 菜单、路由、keep-alive 缓存与业务缓存，由守卫重新走完整引导
   */
  async function refreshSessionAfterSwitch() {
    // 重取角色/权限码；失败不阻塞重载（沿用旧码，下次切换时重试）
    try {
      await authStore.refreshSessionPermissions();
    } catch {
      // 忽略
    }
    // 关闭全部标签页：旧租户专属路由在新视角下可能已不可达，避免残留死标签
    await useTabbarStore().closeAllTabs(router);
    window.location.reload();
  }

  /**
   * 切换至租户
   *
   * @param tenantCode 目标租户编码
   */
  async function switchTo(tenantCode: string) {
    const context = await enterTenantSwitch({ tenantCode });
    current.value = context;
    // 重载会吞掉 toast，切换结果由头部租户名 +「已切换」标签反馈
    await refreshSessionAfterSwitch();
  }

  /**
   * 退出切换租户，回到默认视角
   */
  async function exitSwitch() {
    const context = await exitTenantSwitch();
    current.value = context;
    await refreshSessionAfterSwitch();
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
