<script lang="ts" setup>
import type { SysUserApi } from '#/api';

import type { ParentTreeOption } from '../../dept/data';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { TreeSelect } from 'antdv-next';

import { bindUserDept, buildDeptTree, getDeptList } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const loading = ref(false);
const userId = ref<string>();
const userNickname = ref('');

/** 部门树选项 */
const deptOptions = ref<ParentTreeOption[]>([]);
/** 选中部门ID；清空 = 解除绑定 */
const selectedDeptId = ref<string>();

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
        deptOptions.value = buildDeptTree(await getDeptList());
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
