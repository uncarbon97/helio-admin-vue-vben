<script lang="ts" setup>
// adapt to helium: 文件存储点管理（按钮按权限码显隐）
import type { OnActionClickParams, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FileStorageApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { useAccess } from '@vben/access';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteFileStorage, getFileStorageList } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

// 权限码（对应后端 AdminFileStorageController）
const { hasAccessByCodes } = useAccess();
const hasCreate = hasAccessByCodes(['file:storage:create']);
const hasUpdate = hasAccessByCodes(['file:storage:update']);
const hasDelete = hasAccessByCodes(['file:storage:delete']);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick, hasUpdate, hasDelete),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const [beginAt, endAt] = formValues.createdAtRange ?? [];
          return await getFileStorageList({
            beginAt: beginAt?.toISOString?.(),
            code: formValues.code,
            endAt: endAt?.toISOString?.(),
            name: formValues.name,
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            platformType: formValues.platformType,
            primaryFlag: formValues.primaryFlag,
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
  } as VxeTableGridOptions<FileStorageApi.FileStorageDTO>,
});

function onActionClick(e: OnActionClickParams<FileStorageApi.FileStorageDTO>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

async function onEdit(row: FileStorageApi.FileStorageDTO) {
  formDrawerApi.setData(row).open();
}

async function onDelete(row: FileStorageApi.FileStorageDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteFileStorage(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.name]),
      key: 'action_process_msg',
    });
    onRefresh();
  } catch {
    hideLoading();
  }
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData(null).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button v-if="hasCreate" type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
