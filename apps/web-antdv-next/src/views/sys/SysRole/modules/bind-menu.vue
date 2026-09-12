<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SysRoleApi } from '#/api';
import type { MenuTreeNode } from '#/api/sys/menu';

import { nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'antdv-next';

import { buildMenuTree, getVisibleMenuList } from '#/api/sys/menu';
import { bindRoleMenu } from '#/api/sys/SysRole';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const permissions = ref<MenuTreeNode[]>([]);
const loadingPermissions = ref(false);
const checkedMenuIds = ref<string[]>([]);

const roleId = ref<string>();
const [Drawer, drawerApi] =
  useVbenDrawer<null | Partial<SysRoleApi.SysRoleDTO>>({
    async onConfirm() {
      if (!roleId.value) return;
      drawerApi.lock();
      try {
        await bindRoleMenu(roleId.value, checkedMenuIds.value);
        emits('success');
        drawerApi.close();
      } catch {
        drawerApi.unlock();
      }
    },

    async onOpenChange(isOpen) {
      if (isOpen) {
        const data = drawerApi.getData();
        roleId.value = data?.id;

        if (permissions.value.length === 0) {
          await loadPermissions();
        }
        // Wait for Vue to flush DOM updates (tree mounted)
        await nextTick();
        checkedMenuIds.value = data?.menuIds ?? [];
      }
    },
  });

defineExpose({ drawerApi });

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getVisibleMenuList();
    permissions.value = buildMenuTree(res ?? []);
  } finally {
    loadingPermissions.value = false;
  }
}

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.menuType === 'BUTTON') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="$t('system.role.bindMenuTitle')">
    <Spin :spinning="loadingPermissions" :classes="{ root: 'w-full' }">
      <Tree
        v-model="checkedMenuIds"
        :tree-data="permissions"
        multiple
        bordered
        :include-indeterminate="true"
        :default-expanded-level="2"
        :get-node-class="getNodeClass"
        value-field="id"
        label-field="name"
        icon-field="icon"
      >
        <template #node="{ value }">
          <IconifyIcon v-if="value.icon" :icon="value.icon" />
          {{ value.name }}
        </template>
      </Tree>
    </Spin>
  </Drawer>
</template>
