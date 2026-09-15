<script lang="ts" setup>
// adapt to helium: 文件管理（列表 + 复制链接 + 删除，无新增/编辑）
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileMetaApi } from '#/api';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteFileMeta, getFileMetaList } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

// 权限码
const { hasAccessByCodes } = useAccess();
const hasDelete = hasAccessByCodes(['file:meta:delete']);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick, hasDelete),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const [beginAt, endAt] = formValues.createdAtRange ?? [];
          return await getFileMetaList({
            beginAt: beginAt?.toISOString?.(),
            category: formValues.category,
            endAt: endAt?.toISOString?.(),
            extendName: formValues.extendName,
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            storageCode: formValues.storageCode,
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
  } as VxeTableGridOptions<FileMetaApi.FileMetaDTO>,
});

function onActionClick(e: OnActionClickParams<FileMetaApi.FileMetaDTO>) {
  switch (e.code) {
    case 'copyLink': {
      onCopyLink(e.row);
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
  }
}

// adapt to helium: 复制链接（对象存储直链写入剪贴板）
async function onCopyLink(row: FileMetaApi.FileMetaDTO) {
  if (!row.directUrl) {
    message.warning($t('file.meta.directUrlMissing'));
    return;
  }
  try {
    await navigator.clipboard.writeText(row.directUrl);
    message.success($t('file.meta.copyLinkSuccess'));
  } catch {
    message.error($t('file.meta.copyLinkFailed'));
  }
}

async function onDelete(row: FileMetaApi.FileMetaDTO) {
  const displayName = row.extendName
    ? `${row.originalFilename}.${row.extendName}`
    : row.originalFilename;
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [displayName]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteFileMeta(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [displayName]),
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
</script>
<template>
  <Page auto-content-height>
    <Grid />
  </Page>
</template>
