<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileStorageApi } from '#/api';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileStorage,
  getFileStorageDetail,
  getFileStorageList,
  testFileStorage,
} from '#/api';
import { $t } from '#/locales';
import { confirmAction } from '#/utils/confirm';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

// 权限码
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
    case 'testUpload': {
      onTestUpload(e.row);
      break;
    }
  }
}

async function onEdit(row: FileStorageApi.FileStorageDTO) {
  // 修改前拉取详情，保证数据为最新
  const detail = await getFileStorageDetail(row.id);
  formDrawerApi.setData(detail).open();
}

async function onDelete(row: FileStorageApi.FileStorageDTO) {
  const confirmed = await confirmAction(
    $t('ui.actionMessage.deleteConfirm', [row.name]),
  );
  if (!confirmed) return;
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

// 测试上传，验证存储点能否正常上传文件（服务端生成测试文件，支持非主存储点）
async function onTestUpload(row: FileStorageApi.FileStorageDTO) {
  const hideLoading = message.loading({
    content: $t('file.storage.testUploading'),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    const ret = await testFileStorage(row.id);
    hideLoading();
    const confirmed = await confirmAction(
      `${$t('file.storage.testUploadVisitConfirm')}\n(${ret.url})`,
    );
    if (confirmed) {
      window.open(ret.url, '_blank');
    }
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
