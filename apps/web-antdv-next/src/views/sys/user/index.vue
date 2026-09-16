<script lang="ts" setup>
// adapt to helium: 用户管理（左部门树 + 右用户列表）
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysDeptApi, SysUserApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Empty, Input, message, Tree } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  buildDeptTree,
  deleteUser,
  getDeptList,
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

/** 左侧部门树选项（含虚拟根节点 id='' 表示全部用户） */
interface DeptTreeNodeOption extends SysDeptApi.DeptTreeNode {
  children?: DeptTreeNodeOption[];
}

const ALL_DEPT_KEY = '';
const deptTreeData = ref<DeptTreeNodeOption[]>([]);
const selectedDeptId = ref<null | string>(null);
const selectedKeys = ref<string[]>([ALL_DEPT_KEY]);
const deptSearchKeyword = ref('');

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

onMounted(async () => {
  const tree = buildDeptTree(await getDeptList());
  deptTreeData.value = [
    {
      id: ALL_DEPT_KEY,
      name: $t('sys.user.allUsers'),
      parentId: '0',
      sort: 0,
      status: 1,
      createdAt: '',
      updatedAt: '',
      children: tree as DeptTreeNodeOption[],
    },
  ];
});

/** 按关键词过滤部门树（保留命中节点的祖先链） */
const filteredDeptTree = computed<DeptTreeNodeOption[]>(() => {
  const keyword = deptSearchKeyword.value.trim();
  if (!keyword) return deptTreeData.value;

  const filter = (nodes: DeptTreeNodeOption[]): DeptTreeNodeOption[] => {
    const result: DeptTreeNodeOption[] = [];
    nodes.forEach((node) => {
      const children = node.children ? filter(node.children) : undefined;
      if (node.name.includes(keyword) || children?.length) {
        result.push({ ...node, children });
      }
    });
    return result;
  };
  return filter(deptTreeData.value);
});

function onDeptSelect(keys: (number | string)[]) {
  const key = String(keys[0] ?? ALL_DEPT_KEY);
  selectedKeys.value = [key];
  selectedDeptId.value = key === ALL_DEPT_KEY ? null : key;
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
  newStatus: EnabledStatusEnum,
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
    $t('sys.user.kickOut'),
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
      <Card
        class="w-60 shrink-0"
        :body-style="{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }"
      >
        <div class="mb-2 shrink-0">
          <Input
            v-model:value="deptSearchKeyword"
            allow-clear
            :placeholder="$t('sys.dept.searchPlaceholder')"
            size="small"
          />
        </div>
        <div class="min-h-0 flex-1 overflow-auto">
          <Tree
            v-model:selected-keys="selectedKeys"
            :field-names="{ children: 'children', key: 'id', title: 'name' }"
            :tree-data="filteredDeptTree"
            block-node
            default-expand-all
            @select="onDeptSelect"
          />
          <Empty
            v-if="filteredDeptTree.length === 0"
            :image="Empty.PRESENTED_IMAGE_SIMPLE"
            class="py-8"
          />
        </div>
      </Card>
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
