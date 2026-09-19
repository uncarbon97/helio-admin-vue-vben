<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';
import type { MyProfileDTO } from '#/api';
import type { GenderEnumValue } from '#/api/common';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { Avatar, message } from 'antdv-next';

import {
  getMyProfileApi,
  updateMyAvatarApi,
  updateMyProfileApi,
  uploadFileApi,
} from '#/api';
import { GenderEnum } from '#/api/common';
import { useAuthStore } from '#/store';

const userStore = useUserStore();
const authStore = useAuthStore();

const profileBaseSettingRef = ref();

// helium customization: 对接后端用户中心；抽屉/页面打开先清空再请求，避免残留上次数据
const detail = ref<MyProfileDTO>();
const uploading = ref(false);
const fileInputRef = ref<HTMLInputElement>();

const GENDER_OPTIONS: { label: string; value: GenderEnumValue }[] = [
  { label: '未知', value: GenderEnum.UNKNOWN },
  { label: '男', value: GenderEnum.MALE },
  { label: '女', value: GenderEnum.FEMALE },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'nickname',
      component: 'Input',
      label: '昵称',
      componentProps: { maxlength: 20 },
    },
    {
      fieldName: 'gender',
      component: 'Select',
      componentProps: {
        options: GENDER_OPTIONS,
      },
      label: '性别',
    },
    {
      fieldName: 'email',
      component: 'Input',
      label: '邮箱',
    },
    {
      fieldName: 'phoneNo',
      component: 'Input',
      label: '手机号',
    },
  ];
});

const avatarUrl = computed(
  () => detail.value?.avatarUrl || userStore.userInfo?.avatar || preferences.app.defaultAvatar,
);

async function loadDetail() {
  detail.value = undefined;
  detail.value = await getMyProfileApi();
  profileBaseSettingRef.value?.getFormApi().setValues({
    nickname: detail.value.nickname ?? '',
    gender: detail.value.gender ?? GenderEnum.UNKNOWN,
    email: detail.value.email ?? '',
    phoneNo: detail.value.phoneNo ?? '',
  });
}

// helium customization: 头像上传 —— 先走通用上传接口，再提交 /ucenter/avatar/update
async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  uploading.value = true;
  try {
    const uploaded = await uploadFileApi(file);
    await updateMyAvatarApi(uploaded);
    message.success('头像已更新');
    // 刷新全局用户信息（导航栏头像等联动）
    await authStore.fetchUserInfo();
    await loadDetail();
  } finally {
    uploading.value = false;
  }
}

async function handleSubmit(values: Recordable<any>) {
  await updateMyProfileApi({
    nickname: values.nickname,
    gender: values.gender,
    email: values.email,
    phoneNo: values.phoneNo,
  });
  message.success('个人资料已更新');
  await authStore.fetchUserInfo();
}

onMounted(loadDetail);
</script>
<template>
  <div class="flex flex-col gap-6">
    <!-- helium customization: 头像上传（点击选择图片，支持 jpg/jpeg/png/webp） -->
    <div class="flex items-center gap-4">
      <Avatar :src="avatarUrl" :size="72" />
      <div>
        <button
          class="cursor-pointer rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="uploading"
          @click="fileInputRef?.click()"
        >
          {{ uploading ? '上传中…' : '更换头像' }}
        </button>
        <div class="mt-1 text-xs text-muted-foreground">
          支持 jpg / jpeg / png / webp
        </div>
        <input
          ref="fileInputRef"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          type="file"
          @change="handleAvatarChange"
        />
      </div>
    </div>
    <ProfileBaseSetting
      ref="profileBaseSettingRef"
      :form-schema="formSchema"
      @submit="handleSubmit"
    />
  </div>
</template>
