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
        <!-- Helio: 三个菜单（父菜单A、子菜单A1、子菜单A2），都被角色1关联的情况下，如果新增了一个子菜单A3 -->
        <!-- Helio: 由于父菜单A的缘故，未授权的子菜单A3会被错误地勾选 -->
        <BasicTree
          v-model:value="selectedMenuIds"
          :treeData="menuTreeData"
          :fieldNames="{ key: 'id' }"
          :checkStrictly="true"
          checkable
          toolbar
          @check="handleMenuTreeCheck"
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

      function handleMenuTreeCheck(rawVal, event) {
        console.error(rawVal, event);
      }

      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        menuTreeData,
        selectedMenuIds,
        handleMenuTreeCheck,
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
