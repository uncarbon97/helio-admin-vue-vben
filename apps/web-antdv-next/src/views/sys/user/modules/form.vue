<script lang="ts" setup>
import type { DeptOptionNode, SysUserApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  buildDeptOptionTree,
  createUser,
  getDeptSelectOptions,
  updateUser,
} from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SysUserApi.SysUserDTO>();

/** 部门树选项（供所属部门选择） */
const deptOptions = ref<DeptOptionNode[]>([]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(deptOptions),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer<null | SysUserApi.SysUserDTO>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      const idVal = id.value;
      await (idVal
        ? updateUser({
            id: idVal,
            email: values.email,
            gender: values.gender,
            nickname: values.nickname,
            phoneNo: values.phoneNo,
            pin: values.pin,
          })
        : createUser({
            deptId: values.deptId || undefined,
            email: values.email,
            gender: values.gender,
            initPwd: values.initPwd,
            nickname: values.nickname,
            phoneNo: values.phoneNo,
            pin: values.pin,
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
        { fieldName: 'initPwd', hide: !isCreate, rules: 'required' },
        { fieldName: 'deptId', hide: !isCreate },
      ]);

      // 每次打开重新拉取部门树
      deptOptions.value = buildDeptOptionTree(await getDeptSelectOptions());

      if (data) {
        formData.value = data;
        id.value = data.id;
        // 详情仅返回脱敏手机号/邮箱，明文需用户重新填写后提交
        formApi.setValues({
          gender: data.gender,
          nickname: data.nickname,
          pin: data.pin,
        });
        formApi.updateSchema([
          {
            componentProps: { placeholder: data.emailMasked ?? '' },
            fieldName: 'email',
          },
          {
            componentProps: { placeholder: data.phoneNoMasked ?? '' },
            fieldName: 'phoneNo',
          },
        ]);
      } else {
        formApi.updateSchema([
          { componentProps: { placeholder: '' }, fieldName: 'email' },
          { componentProps: { placeholder: '' }, fieldName: 'phoneNo' },
        ]);
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
