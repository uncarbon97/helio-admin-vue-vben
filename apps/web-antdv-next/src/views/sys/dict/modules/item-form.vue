<script lang="ts" setup>
import type { SysDictApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createDictItem, updateDictItem } from '#/api/sys/dict';
import { $t } from '#/locales';

import { useItemFormSchema } from '../data';

const emits = defineEmits(['success']);

/** 抽屉入参：所属分类 + 待编辑行（新增时为空） */
interface DrawerData {
  category: { id: string; name: string };
  row?: SysDictApi.ItemDTO;
}

const formData = ref<DrawerData>();
const id = ref<string>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 长字段名不换行
    labelWidth: 120,
  },
  schema: useItemFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer<DrawerData | null>({
  async onConfirm() {
    const data = formData.value;
    if (!data) return;
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      await (idVal
        ? updateDictItem({
            id: idVal,
            categoryId: data.category.id,
            code: values.code,
            description: values.description,
            label: values.label,
            sort: values.sort,
            status: values.status,
            value: values.value,
          })
        : createDictItem({
            categoryId: data.category.id,
            code: values.code,
            description: values.description,
            label: values.label,
            sort: values.sort,
            status: values.status,
            value: values.value,
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

      if (data) {
        formData.value = data;
        id.value = data.row?.id;
        // 后端无 detail 接口，直接回显行数据
        if (data.row) {
          formApi.setValues({
            code: data.row.code,
            description: data.row.description,
            label: data.row.label,
            sort: data.row.sort,
            status: data.row.status,
            value: data.row.value,
          });
        }
      } else {
        formData.value = undefined;
        id.value = undefined;
      }
    }
  },
});

defineExpose({ drawerApi });

const getDrawerTitle = computed(() => {
  const action = id.value ? $t('common.edit') : $t('common.create');
  const categoryName = formData.value?.category.name ?? '';
  return categoryName ? `${action} - ${categoryName}` : action;
});
</script>
<template>
  <Drawer class="w-[600px]" :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
