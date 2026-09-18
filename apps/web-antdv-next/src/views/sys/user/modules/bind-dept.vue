<script lang="ts" setup>
import type { SysUserApi } from '#/api';

import type { ParentTreeOption } from '../../dept/data';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { TreeSelect } from 'antdv-next';

import { bindUserDept, getDeptSelectOptions } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const loading = ref(false);
const userId = ref<string>();
const userNickname = ref('');

/** 部门树选项 */
const deptOptions = ref<ParentTreeOption[]>([]);
/** 选中部门ID；清空 = 解除绑定 */
const selectedDeptId = ref<string>();

/** 将扁平部门下拉选项按 parentId 构建为树（顺序由后端保证） */
function buildDeptOptionTree(
  list: Awaited<ReturnType<typeof getDeptSelectOptions>>,
): ParentTreeOption[] {
  const nodes = new Map<string, ParentTreeOption>();
  list.forEach((item) => {
    nodes.set(item.id, { id: item.id, name: item.name, children: [] });
  });

  const roots: ParentTreeOption[] = [];
  list.forEach((item) => {
    const node = nodes.get(item.id);
    const parent = nodes.get(item.parentId ?? '0');
    if (node && parent) {
      (parent.children ??= []).push(node);
    } else if (node) {
      roots.push(node);
    }
  });

  const toTree = (items: ParentTreeOption[]): ParentTreeOption[] =>
    items.map(({ children, ...rest }) => ({
      ...rest,
      children: children?.length ? toTree(children) : undefined,
    }));

  return toTree(roots);
}

const [Drawer, drawerApi] = useVbenDrawer<null | SysUserApi.SysUserDTO>({
  async onConfirm() {
    if (!userId.value) return;
    drawerApi.lock();
    try {
      await bindUserDept(userId.value, selectedDeptId.value ?? null);
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      userId.value = data?.id;
      userNickname.value = data?.nickname ?? '';
      selectedDeptId.value = data?.deptId ?? undefined;
      loading.value = true;
      try {
        deptOptions.value = buildDeptOptionTree(await getDeptSelectOptions());
      } finally {
        loading.value = false;
      }
    }
  },
});

defineExpose({ drawerApi });

const getTitle = computed(() =>
  $t('sys.user.bindDeptTitle', [userNickname.value]),
);
</script>
<template>
  <Drawer :title="getTitle" class="w-[480px]">
    <TreeSelect
      v-model:value="selectedDeptId"
      :field-names="{ children: 'children', label: 'name', value: 'id' }"
      :loading="loading"
      :placeholder="$t('sys.user.deptName')"
      :tree-data="deptOptions"
      allow-clear
      class="w-full"
      tree-default-expand-all
    />
  </Drawer>
</template>
