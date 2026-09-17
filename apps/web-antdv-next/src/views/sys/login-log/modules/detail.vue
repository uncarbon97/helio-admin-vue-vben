<script lang="ts" setup>
// adapt to helium: 登录日志详情只读抽屉（点击遮罩可关闭，多行文本用只读多行文本框渲染）
import type { SysLoginLogApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, Spin, Tag, TextArea } from 'antdv-next';

import { getLoginLogDetail, LoginLogTypeEnum, LogResultStatusEnum } from '#/api';
import { $t } from '#/locales';

const loading = ref(false);
const detail = ref<SysLoginLogApi.SysLoginLogDTO>();

const [Drawer, drawerApi] = useVbenDrawer<null | SysLoginLogApi.SysLoginLogDTO>({
  closeOnClickModal: true,
  footer: false,

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      if (!data?.id) return;
      loading.value = true;
      try {
        detail.value = await getLoginLogDetail(data.id);
      } finally {
        loading.value = false;
      }
    }
  },
});

defineExpose({ drawerApi });

const DescriptionItem = Descriptions.Item;

/** 日志类型展示 */
function loginLogTypeTag(value: SysLoginLogApi.SysLoginLogDTO['loginLogType'] | undefined) {
  switch (value) {
    case LoginLogTypeEnum.PASSWORD_LOGIN: {
      return { color: 'processing', label: $t('sys.loginLog.typePasswordLogin') };
    }
    case LoginLogTypeEnum.LOGOUT: {
      return { color: 'default', label: $t('sys.loginLog.typeLogout') };
    }
    default: {
      return { color: 'default', label: value ?? '-' };
    }
  }
}

/** 结果状态展示 */
function resultStatusTag(value: SysLoginLogApi.SysLoginLogDTO['resultStatus'] | undefined) {
  return value === LogResultStatusEnum.SUCCESS
    ? { color: 'success', label: $t('sys.loginLog.resultSuccess') }
    : { color: 'error', label: $t('sys.loginLog.resultFailed') };
}
</script>
<template>
  <Drawer :title="$t('common.detail')" class="w-[640px]">
    <Spin :spinning="loading">
      <Descriptions v-if="detail" bordered :column="2" size="small">
        <DescriptionItem :label="$t('sys.loginLog.createdAt')" :span="2">
          {{ detail.createdAt }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.loginLogType')">
          <Tag :color="loginLogTypeTag(detail.loginLogType).color">
            {{ loginLogTypeTag(detail.loginLogType).label }}
          </Tag>
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.resultStatus')">
          <Tag :color="resultStatusTag(detail.resultStatus).color">
            {{ resultStatusTag(detail.resultStatus).label }}
          </Tag>
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.userPin')">
          {{ detail.userPin }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.userId')">
          {{ detail.userId }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.userTypeCode')">
          {{ detail.userTypeCode }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.visitorIp')">
          {{ detail.visitorIp }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.visitorIpLocation')" :span="2">
          {{ detail.visitorIpLocation }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.visitorBrowser')">
          {{ detail.visitorBrowser }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.loginLog.visitorOs')">
          {{ detail.visitorOs }}
        </DescriptionItem>
        <!-- 可能是多行文本，用只读多行文本框渲染 -->
        <DescriptionItem :label="$t('sys.loginLog.failedMsg')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.failedMsg ?? ''"
          />
        </DescriptionItem>
      </Descriptions>
    </Spin>
  </Drawer>
</template>
