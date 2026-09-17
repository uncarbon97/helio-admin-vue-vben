<script lang="ts" setup>
import type { SysOperateLogApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, Spin, Tag, TextArea } from 'antdv-next';

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

const DescriptionItem = Descriptions.Item;

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
        <DescriptionItem :label="$t('sys.operateLog.createdAt')" :span="2">
          {{ detail.createdAt }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.resultStatus')">
          <Tag :color="resultStatusTag(detail.resultStatus).color">
            {{ resultStatusTag(detail.resultStatus).label }}
          </Tag>
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.bizType')">
          {{ detail.bizType }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.behavior')">
          {{ detail.behavior }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.bizNo')">
          {{ detail.bizNo }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.userPin')">
          {{ detail.userPin }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.userTypeCode')">
          {{ detail.userTypeCode }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.requestMethod')">
          {{ detail.requestMethod }}
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.visitorIp')" :span="2">
          {{ detail.visitorIp }}
        </DescriptionItem>
        <DescriptionItem
          :label="$t('sys.operateLog.visitorIpLocation')"
          :span="2"
        >
          {{ detail.visitorIpLocation }}
        </DescriptionItem>
        <!-- 可能是多行文本，用只读多行文本框渲染 -->
        <DescriptionItem :label="$t('sys.operateLog.requestPath')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.requestPath"
          />
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.operation')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 8 }"
            readonly
            :value="detail.operation"
          />
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.bizExtra')" :span="2">
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.bizExtra"
          />
        </DescriptionItem>
        <DescriptionItem
          :label="$t('sys.operateLog.visitorUserAgent')"
          :span="2"
        >
          <TextArea
            :autosize="{ minRows: 1, maxRows: 6 }"
            readonly
            :value="detail.visitorUserAgent"
          />
        </DescriptionItem>
        <DescriptionItem :label="$t('sys.operateLog.failedMsg')" :span="2">
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
