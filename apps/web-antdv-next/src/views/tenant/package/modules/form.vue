<script lang="ts" setup>
// adapt to helium: 租户套餐新增/编辑抽屉
import type { TenantPackageApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createTenantPackage, updateTenantPackage } from '#/api/tenant/package';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<TenantPackageApi.TenantPackageDTO>();

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 长字段名不换行
    labelWidth: 120,
  },
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<
  null | TenantPackageApi.TenantPackageDTO
>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      const payload = {
        code: values.code,
        description: values.description,
        name: values.name,
        // adapt to helium: 状态不走表单：新增默认启用，修改保持原状态（由列表行内开关切换）
        status: formData.value?.status ?? 1,
      };
      await (idVal
        ? updateTenantPackage({ id: idVal, ...payload })
        : createTenantPackage(payload));
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
        id.value = data.id;
        formApi.setValues({
          code: data.code,
          description: data.description,
          name: data.name,
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
