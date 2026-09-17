<script lang="ts" setup>
import type { SysUserApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { DescriptionsItem, Descriptions, Spin, Tag } from 'antdv-next';

import { getUserDetail } from '#/api';
import { EnabledStatusEnum, GenderEnum } from '#/api/common';
import { $t } from '#/locales';

const loading = ref(false);
const detail = ref<SysUserApi.SysUserDTO>();

const [Drawer, drawerApi] = useVbenDrawer<null | SysUserApi.SysUserDTO>({
  closeOnClickModal: true,
  footer: false,

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      // 先清空，避免加载中展示上一次的详情数据
      detail.value = undefined;
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

/** 性别展示 */
function genderTag(value: undefined | SysUserApi.SysUserDTO['gender']) {
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
          {{ detail.phoneNo }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.email')" :span="2">
          {{ detail.email }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.lastLoginAt')">
          {{ detail.lastLoginAt ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.user.createTime')">
          {{ detail.createdAt }}
        </DescriptionsItem>
      </Descriptions>
    </Spin>
  </Drawer>
</template>
