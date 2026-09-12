<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { EnabledStatusEnum } from '#/api/common';
import type { SysRoleApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRole,
  getRoleDetail,
  getRoleList,
  updateRoleStatus,
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
    columns: useColumns(onActionClick, onToggleStatus),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getRoleList({
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
  } as VxeTableGridOptions<SysRoleApi.SysRoleDTO>,
});

function onActionClick(e: OnActionClickParams<SysRoleApi.SysRoleDTO>) {
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

async function onEdit(row: SysRoleApi.SysRoleDTO) {
  // 修改前拉取详情，保证 menuIds（授权回显）为最新
  const detail = await getRoleDetail(row.id);
  formDrawerApi.setData(detail).open();
}

/**
 * 状态开关切换（成功后由 CellSwitch 渲染器行内更新，失败回弹）
 */
async function onToggleStatus(
  row: SysRoleApi.SysRoleDTO,
  newStatus: EnabledStatusEnum,
) {
  await updateRoleStatus([row.id], newStatus);
  message.success($t('ui.actionMessage.operationSuccess'));
}

async function onDelete(row: SysRoleApi.SysRoleDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteRole(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.name]),
      key: 'action_process_msg',
    });
    onRefresh();
  } catch {
    hideLoading();
  }
}

/**
 * 新增成功后刷新列表，并询问是否立即为该角色绑定菜单
 * @param newId 新角色ID（依赖后端 create 返回新记录ID）
 */
function onCreated(newId: string) {
  onRefresh();
  if (!newId) return;
  Modal.confirm({
    content: $t('system.role.confirmBindMenu'),
    onOk() {
      bindMenuDrawerApi.setData({ id: newId }).open();
    },
    title: $t('system.role.bindMenuTitle'),
  });
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
    <FormDrawer @success="onRefresh" @created="onCreated" />
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
