<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysUserApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUser,
  getUserDetail,
  getUserList,
  kickOutUser,
  setUserStatus,
} from '#/api';
import { $t } from '#/locales';
import { confirmAction } from '#/utils/confirm';

import { useColumns, useGridFormSchema } from './data';
import BindDept from './modules/bind-dept.vue';
import BindRole from './modules/bind-role.vue';
import DeptTreeCard from './modules/dept-tree-card.vue';
import Detail from './modules/detail.vue';
import Form from './modules/form.vue';
import ResetPassword from './modules/reset-password.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
  // 详情抽屉允许点击遮罩关闭
  closeOnClickModal: true,
});

const [BindRoleDrawer, bindRoleDrawerApi] = useVbenDrawer({
  connectedComponent: BindRole,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [BindDeptDrawer, bindDeptDrawerApi] = useVbenDrawer({
  connectedComponent: BindDept,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [ResetPwdDrawer, resetPwdDrawerApi] = useVbenDrawer({
  connectedComponent: ResetPassword,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const selectedDeptId = ref<null | string>(null);

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
          return await getUserList({
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            phoneNo: formValues.phoneNo,
            // 左侧部门树联动过滤
            selectedDeptId: selectedDeptId.value ?? undefined,
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
  } as VxeTableGridOptions<SysUserApi.SysUserDTO>,
});

function onDeptSelect(deptId: null | string) {
  selectedDeptId.value = deptId;
  gridApi.query();
}

function onActionClick(e: OnActionClickParams<SysUserApi.SysUserDTO>) {
  switch (e.code) {
    case 'bindDept': {
      bindDeptDrawerApi.setData(e.row).open();
      break;
    }
    case 'bindRole': {
      bindRoleDrawerApi.setData(e.row).open();
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'detail': {
      detailDrawerApi.setData(e.row).open();
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'kickOut': {
      onKickOut(e.row);
      break;
    }
    case 'resetPwd': {
      resetPwdDrawerApi.setData(e.row).open();
      break;
    }
  }
}

async function onEdit(row: SysUserApi.SysUserDTO) {
  // 修改前拉取详情，保证数据为最新
  const detail = await getUserDetail(row.id);
  formDrawerApi.setData(detail).open();
}

/**
 * 状态开关切换（成功后由 CellSwitch 渲染器行内更新，失败回弹）
 */
async function onToggleStatus(
  row: SysUserApi.SysUserDTO,
  newStatus: EnabledStatusEnumValue,
) {
  await setUserStatus(row.id, newStatus);
  message.success($t('ui.actionMessage.operationSuccess'));
}

async function onDelete(row: SysUserApi.SysUserDTO) {
  const confirmed = await confirmAction(
    $t('ui.actionMessage.deleteConfirm', [row.nickname]),
  );
  if (!confirmed) return;
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.nickname]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteUser(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.nickname]),
      key: 'action_process_msg',
    });
    onRefresh();
  } catch {
    hideLoading();
  }
}

/** 踢下线（二次确认，居中模态框） */
async function onKickOut(row: SysUserApi.SysUserDTO) {
  const confirmed = await confirmAction(
    $t('sys.user.kickOutConfirm', [row.nickname]),
    { title: $t('sys.user.kickOut') },
  );
  if (!confirmed) return;
  await kickOutUser(row.id);
  message.success($t('ui.actionMessage.operationSuccess'));
  onRefresh();
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
    <DetailDrawer />
    <BindRoleDrawer @success="onRefresh" />
    <BindDeptDrawer @success="onRefresh" />
    <ResetPwdDrawer @success="onRefresh" />
    <div class="flex h-full w-full gap-2">
      <!-- 左侧部门树 -->
      <div class="w-60 shrink-0">
        <DeptTreeCard @select="onDeptSelect" />
      </div>
      <!-- 右侧用户列表 -->
      <div class="min-w-0 flex-1">
        <Grid>
          <template #toolbar-tools>
            <Button type="primary" @click="onCreate">
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create') }}
            </Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
