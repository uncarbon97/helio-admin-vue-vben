<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { exportOperateLogExcel } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

/** 导出选项表单：筛选条件直接沿用列表上方查询表单（onExport 传入） */
const [Form, formApi] = useVbenForm({
  schema: [
    {
      component: 'Switch',
      fieldName: 'includeUserAgent',
      label: $t('sys.operateLog.exportIncludeUA'),
    },
  ],
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer<Recordable<any>>({
  async onConfirm() {
    const { includeUserAgent } = await formApi.getValues();
    // 筛选条件 = 列表上方查询表单当前值
    const values = drawerApi.getData() ?? {};
    const [beginAt, endAt] = values.createdAtRange ?? [];
    drawerApi.lock();
    try {
      await exportOperateLogExcel({
        beginAt: beginAt?.toISOString?.(),
        endAt: endAt?.toISOString?.(),
        behavior: values.behavior,
        bizNo: values.bizNo,
        bizType: values.bizType,
        includeUserAgent: includeUserAgent === true,
        resultStatus: values.resultStatus,
        userIds: (values.users ?? []).map((item: { id: string }) => item.id),
      });
      message.success($t('ui.actionMessage.operationSuccess'));
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      formApi.reset();
    }
  },
});

defineExpose({ drawerApi });
</script>
<template>
  <Drawer :title="$t('sys.operateLog.exportTitle')" class="w-[600px]">
    <div class="mb-4 text-gray-500">{{ $t('sys.operateLog.exportTip') }}</div>
    <Form />
  </Drawer>
</template>
