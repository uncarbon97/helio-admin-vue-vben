<script lang="ts" setup>
// adapt to helium: 操作日志（列表 + 详情）
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysOperateLogApi } from '#/api';

import { Page } from '@vben/common-ui';
import { useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOperateLogList } from '#/api';

import { useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
});

const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const [beginAt, endAt] = formValues.createdAtRange ?? [];
          return await getOperateLogList({
            behavior: formValues.behavior,
            beginAt: beginAt?.toISOString?.(),
            bizNo: formValues.bizNo,
            bizType: formValues.bizType,
            endAt: endAt?.toISOString?.(),
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            resultStatus: formValues.resultStatus,
            userPin: formValues.userPin,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: true,
      export: false,
      // 刷新保持当前页码
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SysOperateLogApi.SysOperateLogDTO>,
});

// adapt to helium: 操作列点击分发
function onActionClick(e: OnActionClickParams<SysOperateLogApi.SysOperateLogDTO>) {
  switch (e.code) {
    case 'detail': {
      detailDrawerApi.setData(e.row).open();
      break;
    }
  }
}
</script>
<template>
  <Page auto-content-height>
    <Grid />
    <DetailDrawer />
  </Page>
</template>
