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
          :treeData="roleData"
          :fieldNames="{ key: 'id' }"
          checkable
          toolbar
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTree, TreeItem } from '/@/components/Tree';
  import { bindRolesApi, listRelatedRoleIdsApi } from '/@/api/sys/SysUserApi';

  export default defineComponent({
    name: 'BindRoleDrawer',
    components: { BasicDrawer, BasicForm, BasicTree },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdateView = ref(true);
      let userId: string;
      // 角色数据
      const roleData = ref<TreeItem[]>([]);
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
            field: '',
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

        // 从列表页带来的角色下拉数据
        roleData.value = data.roleData;

        // 更新当前用户关联角色
        listRelatedRoleIdsApi(userId).then((apiResult: string[]) => {
          selectedRoleIds.value = apiResult;
        });
      });

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

      return { registerDrawer, registerForm, handleSubmit, roleData, selectedRoleIds };
    },
  });
</script>
<style scoped>
  .text-warning {
    font-size: 20px;
    color: red;
  }
</style>
