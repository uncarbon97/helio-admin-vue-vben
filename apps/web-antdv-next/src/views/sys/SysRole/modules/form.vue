<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api';
import type { MenuTreeNode } from '#/api/system/menu';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { buildMenuTree, getVisibleMenuList } from '#/api/system/menu';
import { bindRoleMenu, createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['created', 'success']);

const formData = ref<SystemRoleApi.SysRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<MenuTreeNode[]>([]);
const loadingPermissions = ref(false);

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<null | SystemRoleApi.SysRole>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    const idVal = id.value;
    if (idVal) {
      // 编辑：先保存基础信息，再同步菜单绑定
      updateRole({
        code: values.code,
        description: values.description,
        id: id.value,
        name: values.name,
      })
        .then(() => bindRoleMenu(idVal, values.permissions ?? []))
        .then(() => {
          emits('success');
          drawerApi.close();
        })
        .catch(() => {
          drawerApi.unlock();
        });
    } else {
      // adapt to helium: 后端 create 将返回新记录ID；新增不带菜单，成功后由父级引导单独绑定
      createRole({
        code: values.code,
        description: values.description,
        name: values.name,
      })
        .then((newId) => {
          emits('created', newId);
          emits('success');
          drawerApi.close();
        })
        .catch(() => {
          drawerApi.unlock();
        });
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
