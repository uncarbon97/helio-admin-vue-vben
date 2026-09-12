<script lang="ts" setup>
import type { MenuApi, SysMenuApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { buildMenuTreeFull, createMenu, getMenuList, updateMenu } from '#/api';
import { MenuTypeEnum } from '#/api';
import { $t } from '#/locales';

import { type ParentTreeOption, useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<MenuApi.SysMenuDTO>();

/** 上级菜单树选项（含虚拟根菜单 id=0） */
const parentOptions = ref<ParentTreeOption[]>([]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(parentOptions),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<
  MenuApi.SysMenuDTO | null | { parentId: string }
>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      // 按菜单类型收敛提交字段，隐藏字段的残留值不提交
      const menuType = values.menuType as MenuApi.MenuType;
      const request: SysMenuApi.UpsertRequest = {
        ...(id.value ? { id: id.value } : {}),
        name: values.name,
        parentId: values.parentId ?? '0',
        menuType,
        ...(menuType !== MenuTypeEnum.BUTTON
          ? { icon: values.icon || undefined }
          : {}),
        ...(menuType === MenuTypeEnum.MENU ? { component: values.component } : {}),
        ...(menuType === MenuTypeEnum.EXTERNAL_LINK
          ? { externalLink: values.externalLink }
          : {}),
        ...(menuType === MenuTypeEnum.BUTTON ||
        menuType === MenuTypeEnum.MENU
          ? { permission: values.permission }
          : {}),
        sort: values.sort ?? 0,
        status: values.status,
      };
      await (id.value
        ? updateMenu(request)
        : createMenu(request));
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

      // 每次打开重新拉取菜单树作为上级选项；编辑时剔除自身子树防止成环
      const list = await getMenuList();
      const selfId = data && 'id' in data ? data.id : undefined;
      const tree = buildMenuTreeFull(list);
      parentOptions.value = [
        {
          id: '0',
          name: $t('sys.menu.rootMenu'),
          children: selfId ? filterOutSelf(tree, selfId) : tree,
        },
      ];

      if (data && 'id' in data) {
        formData.value = data;
        id.value = data.id;
        formApi.setValues({
          menuType: data.menuType,
          name: data.name,
          parentId: data.parentId,
          icon: data.icon,
          component: data.component,
          externalLink: data.externalLink,
          permission: data.permission,
          sort: data.sort,
          status: data.status,
        });
      } else {
        formData.value = undefined;
        id.value = undefined;
        // 「新增下级」入口：预选上级菜单
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
  nodes: SysMenuApi.MenuTreeNode[],
  excludeId: string,
): SysMenuApi.MenuTreeNode[] {
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
