<script lang="ts" setup>
import type { SysDictApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createDictCategory, updateDictCategory } from '#/api';
import { $t } from '#/locales';

import { useCategoryFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SysDictApi.CategoryDTO>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 长字段名不换行
    labelWidth: 120,
  },
  schema: useCategoryFormSchema(),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<null | SysDictApi.CategoryDTO>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      const request: SysDictApi.CategoryUpsertRequest = idVal
        ? {
            id: idVal,
            code: values.code,
            description: values.description,
            name: values.name,
            status: values.status,
          }
        : {
            code: values.code,
            description: values.description,
            name: values.name,
            status: values.status,
          };
      await (idVal ? updateDictCategory(request) : createDictCategory(request));
      emits('success', request);
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      // 先清空，避免加载中展示上一次的表单数据
      formApi.reset();
      formData.value = undefined;
      id.value = undefined;

      if (data) {
        formData.value = data;
        id.value = data.id;
        // 后端无 detail 接口，直接回显行数据
        formApi.setValues({
          code: data.code,
          description: data.description,
          name: data.name,
          status: data.status,
        });
      }
    }
  },
});

defineExpose({ drawerApi });

const getDrawerTitle = computed(() => {
  return formData.value?.id ? $t('common.edit') : $t('common.create');
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
