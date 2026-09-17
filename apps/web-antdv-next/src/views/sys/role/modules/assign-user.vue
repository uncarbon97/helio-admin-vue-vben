<script lang="ts" setup>
import type { SysUserApi } from '#/api';

import { computed, ref, watch } from 'vue';

import {
  Empty,
  Input,
  Modal,
  Table,
} from 'antdv-next';

import { bindUserRole, getUserList, listRelatedRole } from '#/api';
import { $t } from '#/locales';

// helium customization: 授权抽屉「角色用户」tab 的添加用户弹窗，搜索勾选后批量绑定
defineOptions({ name: 'AssignUser' });

const props = defineProps<{
  boundUserIds: string[];
  open: boolean;
  roleId: string;
}>();

const emits = defineEmits(['success', 'update:open']);

const keyword = ref('');
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const records = ref<SysUserApi.SysUserDTO[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);
const submitting = ref(false);

const columns = [
  { dataIndex: 'pin', title: $t('sys.user.pin'), width: 130 },
  { dataIndex: 'nickname', title: $t('sys.user.nickname'), width: 130 },
];

/** 已绑定用户不可再选 */
const rowSelection = computed(() => ({
  getCheckboxProps: (record: SysUserApi.SysUserDTO) => ({
    disabled: props.boundUserIds.includes(record.id),
  }),
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

async function query() {
  loading.value = true;
  try {
    const result = await getUserList({
      pageParam: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      },
      phoneNo: keyword.value || undefined,
    });
    records.value = result?.records ?? [];
    total.value = result?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  pageNum.value = 1;
  query();
}

async function onConfirm() {
  if (selectedRowKeys.value.length === 0) return;
  submitting.value = true;
  try {
    // 复用用户侧绑定角色接口：逐用户在现有角色集上追加本角色
    await Promise.all(
      selectedRowKeys.value.map(async (userId) => {
        const roleIds = await listRelatedRole(userId);
        await bindUserRole(userId, [...new Set([...roleIds, props.roleId])]);
      }),
    );
    emits('success');
    close();
  } finally {
    submitting.value = false;
  }
}

function close() {
  emits('update:open', false);
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // 每次打开重置条件，避免残留上次的搜索与勾选
      keyword.value = '';
      pageNum.value = 1;
      selectedRowKeys.value = [];
      query();
    }
  },
);
</script>
<template>
  <Modal
    :confirm-loading="submitting"
    :ok-button-props="{ disabled: selectedRowKeys.length === 0 }"
    :open="props.open"
    :title="$t('sys.role.assignUser')"
    width="640px"
    @cancel="close"
    @ok="onConfirm"
  >
    <div class="mb-2 w-56">
      <Input
        v-model:value="keyword"
        allow-clear
        :placeholder="$t('sys.user.phoneNo')"
        @press-enter="onSearch"
      />
    </div>
    <Table
      :columns="columns"
      :data-source="records"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :row-selection="rowSelection"
      :scroll="{ x: '100%', y: 320 }"
      size="small"
    >
      <template #emptyText>
        <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
      </template>
    </Table>
  </Modal>
</template>
