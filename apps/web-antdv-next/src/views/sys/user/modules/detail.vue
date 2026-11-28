<script lang="ts" setup>
import type { SysUserApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { formatDateTime } from '@vben/utils';

import { Button, Descriptions, DescriptionsItem, Spin, Tag } from 'antdv-next';

import { getUserDetail, getUserDetailPlain } from '#/api';
import { EnabledStatusEnum, GenderEnum } from '#/api/common';
import { usePageAccess } from '#/hooks/use-page-access';
import { $t } from '#/locales';

const loading = ref(false);
const detail = ref<SysUserApi.SysUserDTO>();

// 前端按钮权限判断
const access = usePageAccess('sys:user:');

// 明文数据（懒加载）
const plainDetail = ref<SysUserApi.SysUserDTO>();
const plainLoading = ref(false);
const showPhonePlain = ref(false);
const showEmailPlain = ref(false);

const [Drawer, drawerApi] = useVbenDrawer<null | SysUserApi.SysUserDTO>({
  closeOnClickModal: true,
  footer: false,

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      // 先清空，避免加载中展示上一次的详情数据
      detail.value = undefined;
      plainDetail.value = undefined;
      showPhonePlain.value = false;
      showEmailPlain.value = false;
      if (!data?.id) return;
      loading.value = true;
      try {
        detail.value = await getUserDetail(data.id);
      } finally {
        loading.value = false;
      }
    }
  },
});

defineExpose({ drawerApi });

/**
 * 切换隐私字段明文/脱敏展示；首次切换调用接口取明文
 */
async function onTogglePlain(field: 'email' | 'phone') {
  if (field === 'email') {
    showEmailPlain.value = !showEmailPlain.value;
  } else {
    showPhonePlain.value = !showPhonePlain.value;
  }
  if (!(showEmailPlain.value || showPhonePlain.value)) return;
  if (plainDetail.value || !detail.value?.id) return;
  plainLoading.value = true;
  try {
    plainDetail.value = await getUserDetailPlain(detail.value.id);
  } catch {
    // 拉取失败则回退展示脱敏值
    showPhonePlain.value = false;
    showEmailPlain.value = false;
  } finally {
    plainLoading.value = false;
  }
}

/** 性别展示 */
function genderTag(value: SysUserApi.SysUserDTO['gender'] | undefined) {
  switch (value) {
    case GenderEnum.MALE: {
      return { color: 'blue', label: $t('sys.user.genderMale') };
    }
    case GenderEnum.FEMALE: {
      return { color: 'magenta', label: $t('sys.user.genderFemale') };
    }
    default: {
      return { color: 'default', label: $t('sys.user.genderUnknown') };
    }
  }
}
</script>
<template>
  <Drawer :title="$t('common.detail')" class="w-[640px]">
    <Spin :spinning="loading">
      <Descriptions v-if="detail" bordered :column="2" size="small">
        <DescriptionsItem :label="$t('sys.user.pin')">
          {{ detail.pin }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.nickname')">
          {{ detail.nickname }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.gender')">
          <Tag :color="genderTag(detail.gender).color">
            {{ genderTag(detail.gender).label }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.status')">
          <Tag
            :color="
              detail.status === EnabledStatusEnum.ENABLED
                ? 'success'
                : 'error'
            "
          >
            {{
              detail.status === EnabledStatusEnum.ENABLED
                ? $t('common.enabled')
                : $t('common.disabled')
            }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.deptName')">
          {{ detail.deptName ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.phoneNo')">
          <span>
            {{
              showPhonePlain
                ? (plainDetail?.phoneNoPlain ?? '-')
                : (detail.phoneNoMasked ?? '-')
            }}
          </span>
          <Button
            v-if="access.has('read-plain')"
            :loading="plainLoading"
            class="ml-1 h-auto px-1"
            size="small"
            type="link"
            @click="onTogglePlain('phone')"
          >
            <IconifyIcon
              v-if="!plainLoading"
              :icon="
                showPhonePlain
                  ? 'ant-design:eye-invisible-outlined'
                  : 'ant-design:eye-outlined'
              "
            />
            {{
              showPhonePlain
                ? $t('sys.user.hidePlain')
                : $t('sys.user.viewPlain')
            }}
          </Button>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.email')" :span="2">
          <span>
            {{
              showEmailPlain
                ? (plainDetail?.emailPlain ?? '-')
                : (detail.emailMasked ?? '-')
            }}
          </span>
          <Button
            v-if="access.has('read-plain')"
            :loading="plainLoading"
            class="ml-1 h-auto px-1"
            size="small"
            type="link"
            @click="onTogglePlain('email')"
          >
            <IconifyIcon
              v-if="!plainLoading"
              :icon="
                showEmailPlain
                  ? 'ant-design:eye-invisible-outlined'
                  : 'ant-design:eye-outlined'
              "
            />
            {{
              showEmailPlain
                ? $t('sys.user.hidePlain')
                : $t('sys.user.viewPlain')
            }}
          </Button>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.lastLoginAt')">
          {{ formatDateTime(detail.lastLoginAt ?? undefined) || '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.createTime')">
          {{ formatDateTime(detail.createdAt) }}
        </DescriptionsItem>
      </Descriptions>
    </Spin>
  </Drawer>
</template>
