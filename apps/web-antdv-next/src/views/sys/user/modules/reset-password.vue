<script lang="ts" setup>
import type { SysUserApi, YesOrNoEnumValue } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Input, RadioGroup, message } from 'antdv-next';

import { resetUserPassword, YesOrNoEnum } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

/** 随机密码字符集（去除易混淆字符） */
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

const userId = ref<string>();
const userNickname = ref('');
/** 生成的随机密码（16位，契约要求 16-64 位） */
const randomPassword = ref('');
/** 是否要求下次登录改密 */
const mustChangePassword = ref<YesOrNoEnumValue>(YesOrNoEnum.NO);

const [Drawer, drawerApi] = useVbenDrawer<null | SysUserApi.SysUserDTO>({
  async onConfirm() {
    if (!userId.value) return;
    drawerApi.lock();
    try {
      await resetUserPassword(
        userId.value,
        randomPassword.value,
        mustChangePassword.value,
      );
      message.success($t('ui.actionMessage.operationSuccess'));
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      userId.value = data?.id;
      userNickname.value = data?.nickname ?? '';
      regenerate();
    }
  },
});

defineExpose({ drawerApi });

const getTitle = computed(() =>
  $t('sys.user.resetPwdTitle', [userNickname.value]),
);

/** 重新生成随机密码 */
function regenerate() {
  let pwd = '';
  const array = new Uint32Array(16);
  crypto.getRandomValues(array);
  array.forEach((n) => {
    pwd += CHARS.charAt(n % CHARS.length);
  });
  randomPassword.value = pwd;
}

/** 复制到剪贴板 */
async function onCopy() {
  try {
    await navigator.clipboard.writeText(randomPassword.value);
    message.success($t('sys.user.copySuccess'));
  } catch {
    message.error($t('sys.user.copyFailed'));
  }
}
</script>
<template>
  <Drawer :title="getTitle" class="w-[480px]">
    <div class="flex flex-col gap-3">
      <div class="text-gray-500">{{ $t('sys.user.resetPwdTip') }}</div>
      <div class="flex gap-2">
        <Input v-model:value="randomPassword" readonly class="flex-1" />
        <Button @click="regenerate">
          <IconifyIcon class="size-4" icon="ant-design:reload-outlined" />
        </Button>
        <Button type="primary" @click="onCopy">
          <IconifyIcon class="size-4" icon="ant-design:copy-outlined" />
        </Button>
      </div>
      <div class="mt-2 flex items-center gap-3">
        <span>{{ $t('sys.user.nextLoginChangePwd') }}</span>
        <RadioGroup
          v-model:value="mustChangePassword"
          :options="[
            { label: $t('common.no'), value: YesOrNoEnum.NO },
            { label: $t('common.yes'), value: YesOrNoEnum.YES },
          ]"
        />
      </div>
    </div>
  </Drawer>
</template>
