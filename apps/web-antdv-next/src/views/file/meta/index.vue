<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileMetaApi } from '#/api';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Checkbox, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileMeta,
  getFileMetaList,
  getFileStorageSelectOptions,
} from '#/api';
import { YesOrNoEnum } from '#/api/common';
import { usePageAccess } from '#/hooks/use-page-access';
import { $t } from '#/locales';
import { confirmAction } from '#/utils/confirm';

import { permPrefix, useColumns, useGridFormSchema } from './data';

// 前端按钮权限判断
const access = usePageAccess(permPrefix);

onMounted(async () => {
  // 拉取存储点下拉选项，注入查询表单
  const selectOptions = await getFileStorageSelectOptions();
  const options = selectOptions?.map((item) => ({
    label: item.label,
    value: item.storageCode,
  }));
  gridApi.formApi.updateSchema([
    {
      componentProps: {
        allowClear: true,
        options: options ?? [],
      },
      fieldName: 'storageCode',
    },
  ]);
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
          return await getFileMetaList({
            beginAt: beginAt?.toISOString?.(),
            endAt: endAt?.toISOString?.(),
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            category: formValues.category,
            extendName: formValues.extendName,
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
  // 是否一并删除远端原始文件（默认仅删除元数据）
  const deleteRemoteFile = ref(false);
  // 用匿名组件承载 Checkbox，使 render 读取 ref 保持响应式
  const checkboxContent = h({
    setup: () => () =>
      h(
        Checkbox,
        {
          checked: deleteRemoteFile.value,
          'onUpdate:checked': (checked: boolean) => {
            deleteRemoteFile.value = checked;
          },
        },
        () => $t('file.meta.deleteRemoteFile'),
      ),
  });
  const confirmed = await confirmAction(
    $t('ui.actionMessage.deleteConfirm', [displayName]),
    {
      content: h('div', [checkboxContent]),
    },
  );
  if (!confirmed) return;
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [displayName]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteFileMeta(
      row.id,
      deleteRemoteFile.value ? YesOrNoEnum.YES : YesOrNoEnum.NO,
    );
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
