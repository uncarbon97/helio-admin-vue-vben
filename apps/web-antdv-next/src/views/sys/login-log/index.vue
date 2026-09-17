<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysLoginLogApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLoginLogList } from '#/api';

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
          return await getLoginLogList({
            beginAt: beginAt?.toISOString?.(),
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
  } as VxeTableGridOptions<SysLoginLogApi.SysLoginLogDTO>,
});

function onActionClick(e: OnActionClickParams<SysLoginLogApi.SysLoginLogDTO>) {
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
