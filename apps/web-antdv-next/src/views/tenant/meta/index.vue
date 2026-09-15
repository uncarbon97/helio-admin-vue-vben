<script lang="ts" setup>
// adapt to helium: 租户管理（列表 + 新增/编辑 + 删除）
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { TenantMetaApi } from '#/api';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteTenant,
  getTenantMetaDetail,
  getTenantMetaList,
  getTenantPackageList,
} from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
  closeOnClickModal: false,
});

/** 套餐ID👉名称映射（所属套餐列展示） */
const packageNameMap = ref(new Map<string, string>());

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick, packageNameMap),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getTenantMetaList({
            code: formValues.code,
            name: formValues.name,
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
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
  } as VxeTableGridOptions<TenantMetaApi.TenantMetaDTO>,
});

function onActionClick(e: OnActionClickParams<TenantMetaApi.TenantMetaDTO>) {
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

async function onEdit(row: TenantMetaApi.TenantMetaDTO) {
  // 修改前拉取详情，保证数据为最新
  const detail = await getTenantMetaDetail(row.id);
  formDrawerApi.setData(detail).open();
}

async function onDelete(row: TenantMetaApi.TenantMetaDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteTenant(row.id);
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

// adapt to helium: 拉取套餐列表建立 ID👉名称映射（所属套餐列展示）
async function loadPackageNameMap() {
  const page = await getTenantPackageList({
    pageParam: { pageNum: 1, pageSize: 100 },
  });
  packageNameMap.value = new Map(
    (page?.records ?? []).map((item) => [item.id, item.name]),
  );
}

loadPackageNameMap();
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
