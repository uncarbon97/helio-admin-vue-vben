<!-- adapt to helium: 字典分类新增/编辑抽屉（后端无 detail 接口，直接回显行数据） -->
<script lang="ts" setup>
import type { SysDictApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createDictCategory, updateDictCategory } from '#/api/sys/dict';
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
      formApi.reset();

      if (data) {
        formData.value = data;
        id.value = data.id;
        // adapt to helium: 后端无 detail 接口，直接回显行数据
        formApi.setValues({
          code: data.code,
          description: data.description,
          name: data.name,
          status: data.status,
        });
      } else {
        formData.value = undefined;
        id.value = undefined;
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
