<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysUserApi, UiConfigApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUser,
  expelTenantUser,
  getSysUserUIConfigApi,
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
import TenantJoin from './modules/tenant-join.vue';

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

const [TenantJoinDrawer, tenantJoinDrawerApi] = useVbenDrawer({
  connectedComponent: TenantJoin,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const selectedDeptId = ref<null | string>(null);

/** 用户优先模式功能开关（后端UI配置下发） */
const showUserFirstFeatures = ref(false);

/** 「删除」按钮语义（后端UI配置下发） */
const userDeleteAction = ref<UiConfigApi.UserDeleteActionEnumValue>();

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
            phoneNoTail4: formValues.phoneNoTail4,
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

onMounted(async () => {
  // 开关接口失败时按关闭处理，不影响基础功能
  const uiConfig = await getSysUserUIConfigApi().catch(() => undefined);
  showUserFirstFeatures.value = uiConfig?.showUserFirstFeaturesFlag === true;
  userDeleteAction.value = uiConfig?.userDeleteAction;
  // 用户优先模式平台域：行操作补充「移出租户」；租户域：「删除」降级为「移出本租户」
  gridApi.setGridOptions({
    columns: useColumns(
      onActionClick,
      onToggleStatus,
      showUserFirstFeatures.value,
      userDeleteAction.value,
    ),
  });
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
    case 'tenantExpel': {
      onTenantExpel(e.row);
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

/** 移出租户（仅用户优先模式；成功后该用户被强制下线） */
async function onTenantExpel(row: SysUserApi.SysUserDTO) {
  const confirmed = await confirmAction(
    $t('sys.user.tenantExpelConfirm', [row.nickname]),
    {
      dangerTips: [$t('sys.user.tenantExpelTip')],
      title: $t('sys.user.tenantExpel'),
    },
  );
  if (!confirmed) return;
  await expelTenantUser(row.id);
  message.success($t('ui.actionMessage.operationSuccess'));
  onRefresh();
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData(null).open();
}

/** 加入本租户（仅用户优先模式） */
function onTenantJoin() {
  tenantJoinDrawerApi.open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer />
    <BindRoleDrawer @success="onRefresh" />
    <BindDeptDrawer @success="onRefresh" />
    <ResetPwdDrawer @success="onRefresh" />
    <TenantJoinDrawer @success="onRefresh" />
    <div class="flex h-full w-full gap-2">
      <!-- 左侧部门树 -->
      <div class="w-60 shrink-0">
        <DeptTreeCard @select="onDeptSelect" />
      </div>
      <!-- 右侧用户列表 -->
      <div class="min-w-0 flex-1">
        <Grid>
          <template #toolbar-tools>
            <Button
              v-if="showUserFirstFeatures"
              class="mr-2"
              @click="onTenantJoin"
            >
              <IconifyIcon class="size-4" icon="ant-design:user-add-outlined" />
              {{ $t('sys.user.tenantJoin') }}
            </Button>
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
