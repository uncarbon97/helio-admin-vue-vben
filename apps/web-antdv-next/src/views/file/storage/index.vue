<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileStorageApi } from '#/api';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileStorage,
  getFileStorageDetail,
  getFileStorageList,
  testFileStorage,
  uploadFileToStorage,
} from '#/api';
import { usePageAccess } from '#/hooks/use-page-access';
import { $t } from '#/locales';
import { confirmAction } from '#/utils/confirm';

import { permPrefix, useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

// 前端按钮权限判断
const access = usePageAccess(permPrefix);

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
    columns: useColumns(onActionClick, access),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const [beginAt, endAt] = formValues.createdAtRange ?? [];
          return await getFileStorageList({
            beginAt: beginAt?.toISOString?.(),
            endAt: endAt?.toISOString?.(),
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            code: formValues.code,
            name: formValues.name,
            platformType: formValues.platformType,
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
    case 'upload': {
      onUpload(e.row);
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

// 上传自选文件至指定存储点
const UPLOAD_ACCEPT = '.jpg,.png,.webp,.gif,.xlsx';
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadTargetRow = ref<FileStorageApi.FileStorageDTO>();

function onUpload(row: FileStorageApi.FileStorageDTO) {
  uploadTargetRow.value = row;
  // 重置 value，确保选择同一文件也能再次触发 change
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  fileInputRef.value?.click();
}

async function onUploadFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  const row = uploadTargetRow.value;
  if (!file || !row) return;
  const hideLoading = message.loading({
    content: $t('file.storage.uploading', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    const ret = await uploadFileToStorage(file, row.id);
    hideLoading();
    const confirmed = await confirmAction(
      `${$t('file.storage.uploadVisitConfirm')}\n(${ret.url})`,
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
    <!-- 隐藏文件选择框，用于「上传自选文件至指定存储点」 -->
    <input
      ref="fileInputRef"
      :accept="UPLOAD_ACCEPT"
      class="hidden"
      type="file"
      @change="onUploadFileSelected"
    />
    <Grid>
      <template #toolbar-tools>
        <Button
          v-if="access.showCreate"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
