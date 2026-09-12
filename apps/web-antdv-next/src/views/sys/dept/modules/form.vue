<script lang="ts" setup>
import type { SysDeptApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { buildDeptTree, createDept, getDeptList, updateDept } from '#/api';
import { $t } from '#/locales';

import { useFormSchema, type ParentTreeOption } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SysDeptApi.SysDeptDTO>();

/** 上级部门树选项（含虚拟根部门 id=0） */
const parentOptions = ref<ParentTreeOption[]>([]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(parentOptions),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<
  null | { parentId: string } | SysDeptApi.SysDeptDTO
>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      await (idVal
        ? updateDept({
            id: idVal,
            name: values.name,
            parentId: values.parentId ?? '0',
            sort: values.sort ?? 0,
            status: values.status,
          })
        : createDept({
            name: values.name,
            parentId: values.parentId ?? '0',
            sort: values.sort ?? 0,
            status: values.status,
          }));
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

      // 每次打开重新拉取部门树作为上级选项；编辑时剔除自身子树防止成环
      const list = await getDeptList();
      const selfId = data && 'id' in data ? data.id : undefined;
      const tree = buildDeptTree(list);
      parentOptions.value = [
        {
          id: '0',
          name: $t('sys.dept.rootDept'),
          children: selfId ? filterOutSelf(tree, selfId) : tree,
        },
      ];

      if (data && 'id' in data) {
        formData.value = data;
        id.value = data.id;
        formApi.setValues({
          name: data.name,
          parentId: data.parentId,
          sort: data.sort,
          status: data.status,
        });
      } else {
        formData.value = undefined;
        id.value = undefined;
        // 「新增下级」入口：预选上级部门
        if (data?.parentId) {
          formApi.setValues({ parentId: data.parentId });
        }
      }
    }
  },
});

defineExpose({ drawerApi });

const getDrawerTitle = computed(() => {
  return formData.value?.id ? $t('common.edit') : $t('common.create');
});

/**
 * 递归剔除指定 id 节点及其子树（防止把自己挂到自己的后代下）
 */
function filterOutSelf(
  nodes: SysDeptApi.DeptTreeNode[],
  excludeId: string,
): SysDeptApi.DeptTreeNode[] {
  return nodes
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      ...node,
      children: node.children
        ? filterOutSelf(node.children, excludeId)
        : undefined,
    }));
}
</script>
<template>
  <Drawer :title="getDrawerTitle" class="w-[600px]">
    <Form />
  </Drawer>
</template>
