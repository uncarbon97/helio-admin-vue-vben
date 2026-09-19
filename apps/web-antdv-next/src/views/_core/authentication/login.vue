<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import type { AuthApi } from '#/api';

import { computed, h, onMounted, ref } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getLoginChallengeApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

// helium customization: Helium: 登录验证码 —— 对接后端登录挑战（POST /v1/auth/challenge），
// OCR 类型展示图形验证码；验证码一次性消费，登录失败或点击图片后刷新
const loginChallenge = ref<AuthApi.LoginChallenge>();
const loginRef = ref<InstanceType<typeof AuthenticationLogin>>();

const hasOcrChallenge = computed(
  () =>
    !!loginChallenge.value?.captchaId &&
    (loginChallenge.value?.type === 'OCR'),
);

async function refreshChallenge() {
  loginChallenge.value = await getLoginChallengeApi();
  loginRef.value?.getFormApi().setFieldValue('captchaAnswer', '');
}

// helium customization: 移除上游 mock 账号下拉选择器（MOCK_USER_OPTIONS）及其自动填充逻辑，仅保留账号/密码表单；
// 移除上游滑块拖动组件，改用后端图形验证码挑战
const formSchema = computed((): VbenFormSchema[] => {
  const schemas: VbenFormSchema[] = [
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
  ];

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
        h('img', {
          alt: 'captcha',
          class: 'h-9 w-[200px] cursor-pointer rounded-sm',
          onClick: () => refreshChallenge(),
          src: `${loginChallenge.value?.captchaImageEncoded}`,
        }),
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
