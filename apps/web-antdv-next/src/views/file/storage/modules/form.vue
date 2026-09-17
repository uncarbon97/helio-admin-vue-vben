<script lang="ts" setup>
import type { FileStorageApi, PlatformTypeEnumValue } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createFileStorage, updateFileStorage } from '#/api';
import { $t } from '#/locales';

import { ALL_SETTING_FIELDS, SETTING_FIELDS, useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<FileStorageApi.FileStorageDTO>();

/**
 * 按存储平台类型切换配置属性字段显隐
 */
function applySettingFieldsVisible(platformType?: PlatformTypeEnumValue) {
  const visibleFields = new Set(
    platformType ? SETTING_FIELDS[platformType] : [],
  );
  formApi.updateSchema(
    ALL_SETTING_FIELDS.map((fieldName) => ({
      fieldName,
      hide: !visibleFields.has(fieldName),
    })),
  );
}

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 长字段名不换行
    labelWidth: 120,
  },
  schema: useFormSchema(onPlatformTypeChange),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<FileStorageApi.FileStorageDTO | null>(
  {
    async onConfirm() {
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      // 从表单值中收集配置属性，组装为嵌套对象
      const settingBody: Record<string, any> = {};
      const platformType = values.platformType as PlatformTypeEnumValue;
      for (const fieldName of SETTING_FIELDS[platformType] ?? []) {
        settingBody[fieldName] = values[fieldName];
      }
      const request: FileStorageApi.UpsertRequest = {
        code: values.code,
        name: values.name,
        platformType,
        primaryFlag: values.primaryFlag,
        settingBody,
        ...(id.value ? { id: id.value } : {}),
      };
      drawerApi.lock();
      try {
        await (id.value
          ? updateFileStorage(request)
          : createFileStorage(request));
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
          // 详情由列表页编辑入口拉取后传入
          formData.value = data;
          id.value = data.id;
          formApi.setValues({
            code: data.code,
            name: data.name,
            platformType: data.platformType,
            primaryFlag: data.primaryFlag,
            // 配置属性摊平到表单
            ...data.settingBody,
          });
          applySettingFieldsVisible(data.platformType);
        } else {
          applySettingFieldsVisible(undefined);
        }
      }
    },
  },
);

/**
 * 存储平台类型切换：联动配置属性字段显隐，并清空已隐藏字段的值
 */
function onPlatformTypeChange(value: PlatformTypeEnumValue) {
  applySettingFieldsVisible(value);
  formApi.setValues(
    Object.fromEntries(
      ALL_SETTING_FIELDS.filter(
        (fieldName) => !SETTING_FIELDS[value]?.includes(fieldName),
      ).map((fieldName) => [fieldName, undefined]),
    ),
  );
}

defineExpose({ drawerApi });

const getDrawerTitle = computed(() => {
  return formData.value?.id ? $t('common.edit') : $t('common.create');
});
</script>
<template>
  <Drawer :title="getDrawerTitle" class="w-[600px]">
    <Form />
  </Drawer>
</template>
