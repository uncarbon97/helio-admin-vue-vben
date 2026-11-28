<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysOperateLogApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOperateLogList } from '#/api';
import { $t } from '#/locales';
import { usePageAccess } from '#/hooks/use-page-access';

import { permPrefix, useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';
import ExportDrawer from './modules/export.vue';

// 前端按钮权限判断
const access = usePageAccess(permPrefix);

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
});

const [ExportExcelDrawer, exportDrawerApi] = useVbenDrawer({
  connectedComponent: ExportDrawer,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [Grid, gridApi] = useVbenVxeGrid({
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
            beginAt: beginAt?.toISOString?.(),
            endAt: endAt?.toISOString?.(),
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            behavior: formValues.behavior,
            bizNo: formValues.bizNo,
            bizType: formValues.bizType,
            resultStatus: formValues.resultStatus,
            userIds: (formValues.users ?? []).map(
              (item: { id: string }) => item.id,
            ),
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

// 操作列
function onActionClick(
  e: OnActionClickParams<SysOperateLogApi.SysOperateLogDTO>,
) {
  switch (e.code) {
    case 'detail': {
      detailDrawerApi.setData(e.row).open();
      break;
    }
  }
}

/** 批量导出Excel（打开抽屉，带入当前筛选条件） */
async function onExport() {
  const formValues = await gridApi.formApi.getValues();
  exportDrawerApi.setData(formValues).open();
}
</script>
<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-tools>
        <Button
          v-if="access.has('export')"
          type="primary"
          @click="onExport"
        >
          <IconifyIcon class="size-4" icon="ant-design:download-outlined" />
          {{ $t('sys.operateLog.export') }}
        </Button>
      </template>
    </Grid>
    <DetailDrawer />
    <ExportExcelDrawer />
  </Page>
</template>
