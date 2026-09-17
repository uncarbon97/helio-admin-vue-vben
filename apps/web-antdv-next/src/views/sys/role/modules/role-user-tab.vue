<script lang="ts" setup>
import type { SysUserApi } from '#/api';

import { computed, ref, watch } from 'vue';

import { Plus } from '@vben/icons';

import {
  Button,
  Empty,
  Input,
  message,
  Table,
  Tag,
} from 'antdv-next';

import { bindUserRole, listRelatedRole, listRelatedUser, listRelatedUserId } from '#/api';
import { EnabledStatusEnum } from '#/api/common';
import { $t } from '#/locales';
import { confirmAction } from '#/utils/confirm';

import AssignUser from './assign-user.vue';

// helium customization: 授权抽屉「角色用户」tab，展示已绑定用户并支持快速分配/取消分配
defineOptions({ name: 'RoleUserTab' });

const props = defineProps<{
  roleId: string;
}>();

const emits = defineEmits(['change']);

const loading = ref(false);
const keyword = ref('');
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const records = ref<SysUserApi.SysUserDTO[]>([]);
/** 当前角色绑定的全量用户ID（用于全量绑定语义） */
const boundUserIds = ref<string[]>([]);
const selectedRowKeys = ref<string[]>([]);
const assignOpen = ref(false);

const columns = [
  { dataIndex: 'pin', title: $t('sys.user.pin'), width: 130 },
  { dataIndex: 'nickname', title: $t('sys.user.nickname'), minWidth: 130 },
  { dataIndex: 'status', title: $t('sys.user.status'), width: 90 },
  { key: 'operation', title: $t('sys.role.operation'), width: 110 },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (number | string)[]) => {
    selectedRowKeys.value = keys.map(String);
  },
}));

const pagination = computed(() => ({
  current: pageNum.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  total: total.value,
  onChange: (page: number, size: number) => {
    pageNum.value = page;
    pageSize.value = size;
    query();
  },
}));

async function reloadBoundIds() {
  boundUserIds.value = (await listRelatedUserId(props.roleId)) ?? [];
}

async function query() {
  loading.value = true;
  try {
    const result = await listRelatedUser({
      keyword: keyword.value || undefined,
      pageParam: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      },
      roleId: props.roleId,
    });
    records.value = result?.records ?? [];
    total.value = result?.total ?? 0;
    selectedRowKeys.value = [];
  } finally {
    loading.value = false;
  }
}

async function refreshAll() {
  await Promise.all([reloadBoundIds(), query()]);
  emits('change');
}

function onSearch() {
  pageNum.value = 1;
  query();
}

/** 分配用户成功回调 */
function onAssignSuccess() {
  refreshAll();
}

/** 取消分配（单个 / 批量共用），复用用户侧绑定角色接口逐用户剔除本角色 */
async function onCancelAssign(userIds: string[], tipArg: string) {
  const confirmed = await confirmAction(
    $t('sys.role.cancelAssignConfirm', [tipArg]),
  );
  if (!confirmed) return;
  await Promise.all(
    userIds.map(async (userId) => {
      const roleIds = await listRelatedRole(userId);
      await bindUserRole(
        userId,
        roleIds.filter((roleId) => roleId !== props.roleId),
      );
    }),
  );
  message.success($t('ui.actionMessage.operationSuccess'));
  refreshAll();
}

watch(
  () => props.roleId,
  () => {
    if (props.roleId) {
      pageNum.value = 1;
      keyword.value = '';
      refreshAll();
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="pt-2">
    <AssignUser
      v-model:open="assignOpen"
      :role-id="props.roleId"
      :bound-user-ids="boundUserIds"
      @success="onAssignSuccess"
    />
    <!-- 工具栏：添加用户 / 批量取消分配 / 搜索 -->
    <div class="mb-2 flex flex-wrap items-center gap-2">
      <Button type="primary" @click="assignOpen = true">
        <Plus class="size-5" />
        {{ $t('sys.role.assignUser') }}
      </Button>
      <Button
        danger
        :disabled="selectedRowKeys.length === 0"
        @click="onCancelAssign(selectedRowKeys, String(selectedRowKeys.length))"
      >
        {{ $t('sys.role.cancelAssign') }}
      </Button>
      <div class="ml-auto w-56">
        <Input
          v-model:value="keyword"
          allow-clear
          :placeholder="$t('sys.role.searchUserPlaceholder')"
          @press-enter="onSearch"
        />
      </div>
    </div>
    <Table
      :columns="columns"
      :data-source="records"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :row-selection="rowSelection"
      :scroll="{ x: '100%', y: 360 }"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag
            :color="
              record.status === EnabledStatusEnum.ENABLED ? 'success' : 'default'
            "
          >
            {{
              record.status === EnabledStatusEnum.ENABLED
                ? $t('common.enabled')
                : $t('common.disabled')
            }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'operation'">
          <Button
            danger
            size="small"
            type="link"
            @click="onCancelAssign([record.id], `${record.nickname}(${record.pin})`)"
          >
            {{ $t('sys.role.cancelAssign') }}
          </Button>
        </template>
      </template>
      <template #emptyText>
        <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </template>
    </Table>
  </div>
</template>
