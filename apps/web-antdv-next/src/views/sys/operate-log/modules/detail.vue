<script lang="ts" setup>
import type { SysOperateLogApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { DescriptionsItem, Descriptions, Spin, Tag, TextArea } from 'antdv-next';

import { getOperateLogDetail, LogResultStatusEnum } from '#/api';
import { $t } from '#/locales';

const loading = ref(false);
const detail = ref<SysOperateLogApi.SysOperateLogDTO>();

const [Drawer, drawerApi] =
  useVbenDrawer<null | SysOperateLogApi.SysOperateLogDTO>({
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
          detail.value = await getOperateLogDetail(data.id);
        } finally {
          loading.value = false;
        }
      }
    },
  });

defineExpose({ drawerApi });

/** 结果状态展示 */
function resultStatusTag(
  value: SysOperateLogApi.SysOperateLogDTO['resultStatus'] | undefined,
) {
  return value === LogResultStatusEnum.SUCCESS
    ? { color: 'success', label: $t('sys.operateLog.resultSuccess') }
    : { color: 'error', label: $t('sys.operateLog.resultFailed') };
}
</script>
<template>
  <Drawer :title="$t('common.detail')" class="w-[640px]">
    <Spin :spinning="loading">
      <Descriptions v-if="detail" bordered :column="2" size="small">
        <DescriptionsItem :label="$t('sys.operateLog.createdAt')" :span="2">
          {{ detail.createdAt }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.resultStatus')">
          <Tag :color="resultStatusTag(detail.resultStatus).color">
            {{ resultStatusTag(detail.resultStatus).label }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.bizType')">
          {{ detail.bizType }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.behavior')">
          {{ detail.behavior }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.bizNo')">
          {{ detail.bizNo }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.userPin')">
          {{ detail.userPin }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.userTypeCode')">
          {{ detail.userTypeCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.requestMethod')">
          {{ detail.requestMethod }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.visitorIp')" :span="2">
          {{ detail.visitorIp }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('sys.operateLog.visitorIpLocation')"
          :span="2"
        >
          {{ detail.visitorIpLocation }}
        </DescriptionsItem>
        <!-- 可能是多行文本，用只读多行文本框渲染 -->
        <DescriptionsItem :label="$t('sys.operateLog.requestPath')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.requestPath"
          />
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.operation')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 8 }"
            readonly
            :value="detail.operation"
          />
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.bizExtra')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.bizExtra"
          />
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('sys.operateLog.visitorUserAgent')"
          :span="2"
        >
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.visitorUserAgent"
          />
        </DescriptionsItem>
        <DescriptionsItem :label="$t('sys.operateLog.failedMsg')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.failedMsg ?? ''"
          />
        </DescriptionsItem>
      </Descriptions>
    </Spin>
  </Drawer>
</template>
