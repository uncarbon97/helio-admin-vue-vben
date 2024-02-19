<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="绑定角色"
    width="40%"
    @ok="handleSubmit"
  >
    <p class="text-warning text-center">注意：保存成功后，该用户会被强制踢下线</p>
    <BasicForm @register="registerForm">
      <template #menu>
        <!-- Helio: https://github.com/vbenjs/vue-vben-admin/issues/1420 -->
        <BasicTree
          v-model:value="selectedRoleIds"
          :treeData="sysRoleSelectOptions"
          :fieldNames="{ key: 'id', title: 'name' }"
          checkable
          toolbar
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { BasicTree } from '@/components/Tree';
  import { bindRolesApi, listRelatedRoleIdsApi } from '@/api/sys/SysUserApi';

  const isUpdateView = ref(true);
  let userId: string;
  // 角色下拉框数据
  const sysRoleSelectOptions = ref([]);
  // 被选中的角色ID
  const selectedRoleIds = ref<string[]>([]);

  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 24 - 4,
    },
    // Helio: 相较于 Vben 2.3.0 版本，需要添加下面这行来修正样式
    baseColProps: { span: 24 },
    schemas: [
      {
        label: '角色列表',
        field: 'roles',
        slot: 'menu',
        component: 'Input',
      },
    ],
    showActionButtonGroup: false,
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    resetFields();
    setDrawerProps({ confirmLoading: false });
    isUpdateView.value = !!data?.isUpdateView;

    if (unref(isUpdateView)) {
      setFieldsValue({
        ...data.record,
      });
    }

    // 用户ID
    userId = data.record?.id || null;

    // 列表页透传的角色下拉框数据
    sysRoleSelectOptions.value = data.sysRoleSelectOptions;

    // 更新当前用户关联角色
    listRelatedRoleIdsApi(userId).then((apiResult: string[]) => {
      selectedRoleIds.value = apiResult;
    });
  });

  const emit = defineEmits(['success']);
  async function handleSubmit() {
    try {
      await validate();
      setDrawerProps({ confirmLoading: true });

      if (userId) {
        await bindRolesApi(userId, selectedRoleIds.value);
      }

      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
<style scoped>
  .text-warning {
    font-size: 20px;
    color: red;
  }
</style>
