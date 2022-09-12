<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="配置可见菜单"
    width="40%"
    @ok="handleSubmit"
  >
    <p class="text-warning text-center">新授予的权限需要重新登录后才显示；收回的权限立即生效</p>
    <BasicForm @register="registerForm">
      <template #menu>
        <!-- Helio: https://github.com/vbenjs/vue-vben-admin/issues/1420 -->
        <BasicTree
          v-model:value="selectedMenuIds"
          :treeData="menuTreeData"
          :fieldNames="{ key: 'idStr' }"
          checkable
          toolbar
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { bindMenusApi } from '/@/api/sys/SysRoleApi';
  import { BasicTree, TreeItem } from '/@/components/Tree';

  export default defineComponent({
    name: 'BindMenuDrawer',
    components: { BasicDrawer, BasicForm, BasicTree },
    emits: ['success', 'register'],
    setup: function (_, { emit }) {
      let recordId: string;
      // 菜单树状数据
      const menuTreeData = ref<TreeItem[]>([]);
      // 被选中的菜单ID
      const selectedMenuIds = ref<string[]>([]);

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
            label: '菜单列表',
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

        // 主键ID
        recordId = data.record.id || null;

        // 从列表页带来的菜单树状数据、已选中菜单ID
        menuTreeData.value = data.menuTreeData;
        selectedMenuIds.value = data.record.menuIds;

        setFieldsValue({
          ...data.record,
        });
      });

      async function handleSubmit() {
        try {
          await validate();

          setDrawerProps({ confirmLoading: true });

          await bindMenusApi(recordId, selectedMenuIds.value);

          closeDrawer();
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }

      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        menuTreeData,
        selectedMenuIds,
      };
    },
  });
</script>
<style scoped>
  .text-warning {
    font-size: 20px;
    color: red;
  }
</style>
