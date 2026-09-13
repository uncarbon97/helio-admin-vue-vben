<script lang="ts" setup>
// adapt to helium: 用户新增/修改抽屉
import type { SysUserApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  buildDeptTree,
  createUser,
  getDeptList,
  updateUser,
} from '#/api';
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
      if (idVal) {
        // 修改表单剔除 登录改密/所属部门/初始密码，契约必填的 requireNewPwdFlag 不再上送
        await updateUser({
          id: idVal,
          email: values.email,
          gender: values.gender,
          nickname: values.nickname,
          phoneNo: values.phoneNo,
          pin: values.pin,
        });
      } else {
        await createUser({
          deptId: values.deptId || undefined,
          email: values.email,
          gender: values.gender,
          initPwd: values.initPwd,
          nickname: values.nickname,
          phoneNo: values.phoneNo,
          pin: values.pin,
          requireNewPwdFlag: values.requireNewPwdFlag,
        });
      }
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

      // adapt to helium: 初始密码/所属部门/登录改密 仅新增时显示，修改时隐藏
      // （本工程 fork 的表单 if 字段不生效，用 hide 控制显隐）
      const isCreate = !data;
      formApi.updateSchema([
        { fieldName: 'initPwd', hide: !isCreate, rules: 'required' },
        { fieldName: 'deptId', hide: !isCreate },
        { fieldName: 'requireNewPwdFlag', hide: !isCreate },
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
