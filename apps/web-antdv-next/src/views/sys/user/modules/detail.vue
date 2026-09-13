<script lang="ts" setup>
// adapt to helium: 用户详情只读抽屉（点击遮罩可关闭）
import type { SysUserApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, Spin, Tag } from 'antdv-next';

import { GenderEnum, getUserDetail } from '#/api';
import { $t } from '#/locales';

const loading = ref(false);
const detail = ref<SysUserApi.SysUserDTO>();

const [Drawer, drawerApi] = useVbenDrawer<null | SysUserApi.SysUserDTO>({
  closeOnClickModal: true,
  footer: false,

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
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

const DescriptionItem = Descriptions.Item;

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
        <DescriptionItem :label="$t('sys.user.pin')">
          {{ detail.pin }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.nickname')">
          {{ detail.nickname }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.gender')">
          <Tag :color="genderTag(detail.gender).color">
            {{ genderTag(detail.gender).label }}
          </Tag>
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.status')">
          <Tag :color="detail.status === 1 ? 'success' : 'error'">
            {{
              detail.status === 1
                ? $t('common.enabled')
                : $t('common.disabled')
            }}
          </Tag>
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.deptName')">
          {{ detail.deptName ?? '-' }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.phoneNo')">
          {{ detail.phoneNo }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.email')" :span="2">
          {{ detail.email }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.lastLoginAt')">
          {{ detail.lastLoginAt ?? '-' }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.user.createTime')">
          {{ detail.createdAt }}
        </DescriptionItem>
      </Descriptions>
    </Spin>
  </Drawer>
</template>
