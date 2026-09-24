<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import type { AuthApi } from '#/api';

import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { getLoginChallengeApi, getTenantUIConfigApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

// helium customization: Helium: 登录验证码 —— 对接后端登录挑战（POST /v1/auth/login-challenge），
// OCR 类型展示图形验证码；验证码一次性消费，登录失败或点击图片后刷新
const loginChallenge = ref<AuthApi.LoginChallenge>();
const loginRef = ref<InstanceType<typeof AuthenticationLogin>>();

// helium customization: 离线图标集（ant-design）内的刷新图标，内网可用
const RefreshIcon = createIconifyIcon('ant-design:redo-outlined');

const hasOcrChallenge = computed(
  () =>
    !!loginChallenge.value?.captchaId &&
    (loginChallenge.value?.type === 'OCR'),
);

// helium customization: 验证码有效期倒计时 —— 按 validSeconds 计时，超时后覆盖蒙层，需手动点击刷新
const captchaExpired = ref(false);
let captchaTimer: ReturnType<typeof setTimeout> | undefined;

// helium customization: 租户相关UI配置 —— 由后端下发（多租户启用且 TENANT_FIRST 模式时显示租户编码输入框），禁止前端硬编码开关
const tenantUIConfig = ref<AuthApi.LoginTenantUIConfig>();

const showTenantCodeInput = computed(
  () => tenantUIConfig.value?.showTenantCodeInputFlag === true,
);

function clearCaptchaTimer() {
  if (captchaTimer) {
    clearTimeout(captchaTimer);
    captchaTimer = undefined;
  }
}

async function refreshChallenge() {
  clearCaptchaTimer();
  captchaExpired.value = false;
  loginChallenge.value = await getLoginChallengeApi();
  loginRef.value?.getFormApi().setFieldValue('captchaAnswer', '');

  const validSeconds = loginChallenge.value?.validSeconds ?? 0;
  if (hasOcrChallenge.value && validSeconds > 0) {
    captchaTimer = setTimeout(
      () => (captchaExpired.value = true),
      validSeconds * 1000,
    );
  }
}

onBeforeUnmount(clearCaptchaTimer);

// helium customization: 移除上游 mock 账号下拉选择器（MOCK_USER_OPTIONS）及其自动填充逻辑，仅保留账号/密码表单；
// 移除上游滑块拖动组件，改用后端图形验证码挑战
const formSchema = computed((): VbenFormSchema[] => {
  const schemas: VbenFormSchema[] = [];

  // helium customization: 后端下发开关控制是否显示租户编码输入框（登录时随表单提交 tenantCode）
  if (showTenantCodeInput.value) {
    schemas.push({
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.tenantCodeTip'),
      },
      fieldName: 'tenantCode',
      label: $t('authentication.tenantCode'),
    });
  }

  schemas.push(
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  );

  if (hasOcrChallenge.value) {
    schemas.push({
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.code'),
      },
      fieldName: 'captchaAnswer',
      label: $t('authentication.code'),
      rules: z.string().min(1, { message: $t('authentication.codeTip', [4]) }),
      suffix: () =>
        h('div', { class: 'relative' }, [
          h('img', {
            alt: 'captcha',
            class: 'h-9 w-[200px] cursor-pointer rounded-sm',
            onClick: () => refreshChallenge(),
            src: `${loginChallenge.value?.captchaImageEncoded}`,
          }),
          captchaExpired.value
            ? h(
                'div',
                {
                  class:
                    'absolute inset-0 z-10 flex cursor-pointer items-center justify-center gap-1 rounded-sm bg-black/60 text-xs text-white backdrop-blur-[1px]',
                  onClick: () => refreshChallenge(),
                },
                [
                  h(RefreshIcon, { class: 'size-4' }),
                  $t('authentication.captchaRefresh'),
                ],
              )
            : null,
        ]),
    });
  }

  return schemas;
});

async function handleSubmit(values: Recordable<any>) {
  try {
    await authStore.authLogin({
      ...values,
      captchaId: loginChallenge.value?.captchaId,
    });
  } catch {
    // 验证码为一次性，登录失败后刷新
    await refreshChallenge();
  }
}

onMounted(() => {
  refreshChallenge();
  // helium customization: 拉取租户相关UI配置，决定是否渲染租户编码输入框（失败不阻塞登录）
  getTenantUIConfigApi()
    .then((config) => {
      tenantUIConfig.value = config;
    })
    .catch(() => {});
});
</script>

<template>
  <!-- helium customization: 隐藏忘记密码/手机号登录/扫码登录/第三方登录/注册入口 -->
  <AuthenticationLogin
    ref="loginRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-code-login="false"
    :show-forget-password="false"
    :show-qrcode-login="false"
    :show-register="false"
    :show-third-party-login="false"
    @submit="handleSubmit"
  />
</template>
