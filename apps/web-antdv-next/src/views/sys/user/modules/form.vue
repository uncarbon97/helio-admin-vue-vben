<script lang="ts" setup>
import type { SysUserApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { buildDeptTree, createUser, getDeptList, updateUser } from '#/api';
import { $t } from '#/locales';

import type { ParentTreeOption } from '../../dept/data';
import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SysUserApi.SysUserDTO>();

/** 部门树选项（供所属部门选择） */
const deptOptions = ref<ParentTreeOption[]>([]);

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
            mustChangePassword: values.mustChangePassword,
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

      const isCreate = !data;
      formApi.updateSchema([
        { fieldName: 'initPwd', hide: !isCreate, rules: 'required' },
        { fieldName: 'deptId', hide: !isCreate },
        { fieldName: 'mustChangePassword', hide: !isCreate },
      ]);

      // 每次打开重新拉取部门树
      deptOptions.value = buildDeptTree(await getDeptList());

      if (data) {
        formData.value = data;
        id.value = data.id;
        formApi.setValues({
          email: data.email,
          gender: data.gender,
          nickname: data.nickname,
          phoneNo: data.phoneNo,
          pin: data.pin,
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
  <Drawer :title="getDrawerTitle" class="w-[600px]">
    <Form />
  </Drawer>
</template>
