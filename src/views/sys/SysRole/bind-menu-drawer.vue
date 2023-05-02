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
          :fieldNames="{ key: 'id' }"
          checkable
          toolbar
          :ref="baset"
        />
<!--        <Tree-->
<!--          :checkedKeys="selectedMenuIds"-->
<!--          checkable-->
<!--          :tree-data="menuTreeData"-->
<!--          :fieldNames="{ key: 'id' }"-->
<!--          toolbar-->
<!--          :ref="baset"-->
<!--        >-->
<!--          <template #title="{ title, key }">-->
<!--            <span v-if="key === '0-0-1-0'" style="color: #1890ff">{{ title }}</span>-->
<!--            <template v-else>{{ title }}</template>-->
<!--          </template>-->
<!--        </Tree>-->
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { bindMenusApi } from '/@/api/sys/SysRoleApi';
  import { BasicTree, TreeItem } from '/@/components/Tree';
  import { getHasChildMenuMap } from '/@/views/sys/SysRole/data';
  import {Tree} from "ant-design-vue";

  export default defineComponent({
    name: 'BindMenuDrawer',
    components: { BasicDrawer, BasicForm, BasicTree, Tree },
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

        // 从列表页带来的菜单树状数据
        menuTreeData.value = data.menuTreeData;

        // 从列表页带来的已选中菜单ID
        // 三个菜单（父菜单A、子菜单A1、子菜单A2），都被角色1关联的情况下，如果新增了一个子菜单A
        // 由于父菜单A的缘故，未授权的子菜单A3会被错误地勾选，所以前端显示时剔除存在子项的菜单，由父子联动自动勾选
        const hasChildMenuMap = getHasChildMenuMap().value;
        selectedMenuIds.value = data.record.menuIds.filter(item => !hasChildMenuMap.has(item));

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

      const baset = ref();

      onMounted(() => {
        console.error('baset')
        console.error(baset)
      });

      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        menuTreeData,
        selectedMenuIds,
        baset,
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
