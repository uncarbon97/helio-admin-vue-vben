<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SysRoleApi } from '#/api';
import type { MenuTreeNode } from '#/api/sys/menu';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { buildMenuTree, getVisibleMenuList } from '#/api/sys/menu';
import { bindRoleMenu, createRole, updateRole } from '#/api/sys/SysRole';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['created', 'success']);

const formData = ref<SysRoleApi.SysRoleDTO>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<MenuTreeNode[]>([]);
const loadingPermissions = ref(false);

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<null | SysRoleApi.SysRoleDTO>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      if (idVal) {
        // 编辑：先保存基础信息，再同步菜单绑定
        await updateRole({
          id: idVal,
          code: values.code,
          description: values.description,
          name: values.name,
        });
        await bindRoleMenu(idVal, values.permissions ?? []);
      } else {
        // 后端将返回新记录ID，另外引导授权
        const newId = await createRole({
          code: values.code,
          description: values.description,
          name: values.name,
        });
        emits('created', newId);
      }
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      formApi.reset();

      // 新增模式隐藏授权树字段，编辑模式显示
      await formApi.updateSchema([{ fieldName: 'permissions', hide: !data }]);

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        formData.value = undefined;
        id.value = undefined;
      }

      if (data && permissions.value.length === 0) {
        await loadPermissions();
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues({
          code: data.code,
          description: data.description,
          name: data.name,
          permissions: data.menuIds ?? [],
        });
      }
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

const getDrawerTitle = computed(() => {
  return formData.value?.id ? $t('common.edit') : $t('common.create');
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.menuType === 'BUTTON') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" :classes="{ root: 'w-full' }">
          <Tree
            :tree-data="permissions"
            multiple
            bordered
            :include-indeterminate="true"
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps.componentProps"
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
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    @apply ml-5 hidden;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    @apply ml-5 flex flex-auto justify-end;
  }
}
</style>
