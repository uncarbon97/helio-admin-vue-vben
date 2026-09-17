<script lang="ts" setup>
import type { SelectOptionItem, TenantMetaApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createTenant,
  getTenantPackageList,
  updateTenant,
} from '#/api';
import { EnabledStatusEnum } from '#/api/common';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<TenantMetaApi.TenantMetaDTO>();

/** 租户套餐下拉选项 */
const packageOptions = ref<SelectOptionItem[]>([]);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 长字段名不换行
    labelWidth: 120,
  },
  schema: useFormSchema(packageOptions),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<null | TenantMetaApi.TenantMetaDTO>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      await (idVal
        ? updateTenant({
            id: idVal,
            name: values.name,
            packageId: values.packageId || undefined,
            // 状态不走表单，保持修改前状态（由列表行内开关切换）
            status: formData.value?.status ?? EnabledStatusEnum.ENABLED,
          })
        : createTenant({
            code: values.code,
            name: values.name,
            packageId: values.packageId || undefined,
            tenantAdminEmail: values.tenantAdminEmail,
            tenantAdminPhoneNo: values.tenantAdminPhoneNo,
            tenantAdminPin: values.tenantAdminPin,
            tenantAdminPwd: values.tenantAdminPwd,
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

      const isCreate = !data;
      formApi.updateSchema([
        { fieldName: 'code', hide: !isCreate },
        {
          fieldName: 'tenantAdminPin',
          hide: !isCreate,
          rules: 'required',
        },
        { fieldName: 'tenantAdminPwd', hide: !isCreate, rules: 'required' },
        { fieldName: 'tenantAdminEmail', hide: !isCreate, rules: 'required' },
        {
          fieldName: 'tenantAdminPhoneNo',
          hide: !isCreate,
          rules: 'required',
        },
      ]);

      // 每次打开重新拉取套餐选项（后端暂无套餐下拉专用接口，取列表首页）
      const page = await getTenantPackageList({
        pageParam: { pageNum: 1, pageSize: 100 },
      });
      packageOptions.value = (page?.records ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      }));

      if (data) {
        formData.value = data;
        id.value = data.id;
        formApi.setValues({
          name: data.name,
          packageId: data.packageId,
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
  <Drawer :title="getDrawerTitle" class="w-[600px]">
    <Form />
  </Drawer>
</template>
