<script lang="ts" setup>
// adapt to helium: 租户管理（列表 + 新增/编辑 + 删除）
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { TenantMetaApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteTenant,
  getTenantMetaDetail,
  getTenantMetaList,
  getTenantPackageSelectOptions,
} from '#/api';
import { updateTenant } from '#/api/tenant/meta';
import { $t } from '#/locales';
import { confirmAction } from '#/utils/confirm';

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
    columns: useColumns(onActionClick, packageNameMap, onToggleStatus),
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

/**
 * 状态开关切换（二次确认；成功后由 CellSwitch 渲染器行内更新，失败/取消回弹）
 * 后端无独立 set-status 接口，走 update 全量修改
 */
async function onToggleStatus(
  row: TenantMetaApi.TenantMetaDTO,
  newStatus: EnabledStatusEnum,
) {
  const actionText =
    newStatus === 1 ? $t('common.enabled') : $t('common.disabled');
  const confirmed = await confirmAction(
    $t('tenant.meta.statusChangeConfirm', [actionText, row.name]),
  );
  if (!confirmed) {
    throw new Error('cancelled');
  }
  await updateTenant({
    id: row.id,
    name: row.name,
    packageId: row.packageId || undefined,
    status: newStatus,
  });
  message.success($t('ui.actionMessage.operationSuccess'));
}

async function onDelete(row: TenantMetaApi.TenantMetaDTO) {
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

// 拉取租户套餐下拉选项建立 ID👉名称映射（所属套餐列展示）
async function loadPackageNameMap() {
  const options = await getTenantPackageSelectOptions();
  packageNameMap.value = new Map(
    (options ?? []).map((item) => [item.value, item.label]),
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
