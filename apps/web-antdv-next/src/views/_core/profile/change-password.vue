<script setup lang="ts">
import { Alert } from 'antdv-next';

import PasswordSetting from './password-setting.vue';

// adapt to helium: 强制修改密码页（requireNewPwdFlag=YES 时守卫强制跳转至此），无布局、不可绕过
defineOptions({ name: 'ChangePassword' });
</script>
<template>
  <div class="bg-background flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <h2 class="mb-4 text-lg font-semibold">修改密码</h2>
      <Alert
        class="mb-6"
        message="管理员已重置您的密码，请先修改密码后再继续使用"
        show-icon
        type="warning"
      />
      <PasswordSetting class="w-full" />
    </div>
  </div>
</template>
