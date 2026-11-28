<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';

import { message } from 'antdv-next';

import { updateMyPasswordApi } from '#/api';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';

defineOptions({ name: 'ProfilePasswordSetting' });

const authStore = useAuthStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: $t('profile.passwordSetting.oldPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('profile.passwordSetting.oldPasswordPlaceholder'),
      },
      rules: 'required',
    },
    {
      fieldName: 'newPassword',
      label: $t('profile.passwordSetting.newPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('profile.passwordSetting.newPasswordPlaceholder'),
      },
      rules: 'required',
    },
    {
      fieldName: 'confirmPassword',
      label: $t('profile.passwordSetting.confirmPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('profile.passwordSetting.confirmPasswordPlaceholder'),
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({
              error: $t('profile.passwordSetting.confirmPasswordPlaceholder'),
            })
            .min(1, {
              message: $t('profile.passwordSetting.confirmPasswordPlaceholder'),
            })
            .refine((value) => value === newPassword, {
              message: $t('profile.passwordSetting.passwordMismatch'),
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

// helium customization: 对接真实修改密码接口；成功后后端会话已过期，直接回登录页
async function handleSubmit(values: Recordable<any>) {
  await updateMyPasswordApi({
    confirmNeo: values.confirmPassword,
    neo: values.newPassword,
    old: values.oldPassword,
  });
  message.success($t('profile.passwordSetting.success'));
  await authStore.logout(false);
}
</script>
<template>
  <ProfilePasswordSetting
    class="w-1/3"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
