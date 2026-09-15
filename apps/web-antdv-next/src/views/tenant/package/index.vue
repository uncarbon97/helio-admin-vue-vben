<script lang="ts" setup>
// adapt to helium: 租户套餐管理（列表 + 新增/编辑 + 授权 + 删除）
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { TenantPackageApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteTenantPackage,
  getTenantPackageDetail,
  getTenantPackageList,
} from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import BindMenu from './modules/bind-menu.vue';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [BindMenuDrawer, bindMenuDrawerApi] = useVbenDrawer({
  connectedComponent: BindMenu,
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
          return await getTenantPackageList({
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
  } as VxeTableGridOptions<TenantPackageApi.TenantPackageDTO>,
});

function onActionClick(e: OnActionClickParams<TenantPackageApi.TenantPackageDTO>) {
  switch (e.code) {
    case 'bindMenu': {
      onBindMenu(e.row);
      break;
    }
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

async function onEdit(row: TenantPackageApi.TenantPackageDTO) {
  // 修改前拉取详情，保证数据为最新
  const detail = await getTenantPackageDetail(row.id);
  formDrawerApi.setData(detail).open();
}

/**
 * 授权（绑定菜单）独立入口：拉取详情保证 menuIds 回显为最新
 */
async function onBindMenu(row: TenantPackageApi.TenantPackageDTO) {
  const detail = await getTenantPackageDetail(row.id);
  bindMenuDrawerApi.setData(detail).open();
}

async function onDelete(row: TenantPackageApi.TenantPackageDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteTenantPackage(row.id);
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
    <BindMenuDrawer @success="onRefresh" />
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
