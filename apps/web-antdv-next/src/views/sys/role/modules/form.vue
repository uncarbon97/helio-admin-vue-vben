<script lang="ts" setup>
import type { SysRoleApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createRole, updateRole } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SysRoleApi.SysRoleDTO>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 长字段名不换行
    labelWidth: 120,
  },
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<null | SysRoleApi.SysRoleDTO>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      await (idVal
        ? updateRole({
            id: idVal,
            code: values.code,
            description: values.description,
            name: values.name,
          })
        : createRole({
            code: values.code,
            description: values.description,
            name: values.name,
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
      // 先清空，避免加载中展示上一次的表单数据
      formApi.reset();
      formData.value = undefined;
      id.value = undefined;

      if (data) {
        formData.value = data;
        id.value = data.id;
        formApi.setValues({
          code: data.code,
          description: data.description,
          name: data.name,
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
