<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="绑定菜单"
    width="40%"
    @ok="handleSubmit"
  >
    <p class="text-warning text-center">新授予的权限需要重新登录后才显示；收回的权限立即生效</p>
    <BasicForm @register="registerForm">
      <template #menu>
        <!-- Helio: https://github.com/vbenjs/vue-vben-admin/issues/1420 -->
        <BasicTree
          ref="menuTreeRef"
          v-model:checkedKeys="checkedMenuIds"
          :treeData="menuTreeData"
          :fieldNames="{ key: 'id' }"
          checkable
          toolbar
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { bindMenusApi } from '@/api/sys/SysRoleApi';
  import { BasicTree, TreeItem } from '@/components/Tree';

  let recordId: string;
  // 菜单树状数据
  const menuTreeData = ref<TreeItem[]>([]);
  // 被选中的菜单ID
  const checkedMenuIds = ref<string[]>([]);
  // 树组件Ref
  const menuTreeRef = ref();

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
    recordId = data.record?.id || null;

    // 列表页透传的菜单树状数据和map
    menuTreeData.value = data.menuTreeData;
    const hasChildMenuMap = data.hasChildMenuMap;

    // 列表页透传的已选中菜单ID
    // 三个菜单（父菜单A、子菜单A1、子菜单A2），都被角色1关联的情况下，如果新增了一个子菜单A3
    // 由于父菜单A的缘故，未授权的子菜单A3会被错误地勾选，所以前端显示时剔除存在子项的父菜单，由父子联动自动勾选
    checkedMenuIds.value = data.record.menuIds.filter((item) => !hasChildMenuMap.has(item));
    menuTreeRef.value.resetEverChecked();

    setFieldsValue({
      ...data.record,
    });
  });

  const emit = defineEmits(['success']);

  async function handleSubmit() {
    try {
      await validate();

      setDrawerProps({ confirmLoading: true });

      const everChecked = menuTreeRef.value.isEverChecked();
      if (everChecked) {
        // 发生过勾选事件，才请求接口更新
        const newestMenuIds = [...checkedMenuIds.value, ...menuTreeRef.value.getHalfCheckedKeys()];
        await bindMenusApi(recordId, newestMenuIds);
      }

      closeDrawer();
      if (everChecked) {
        emit('success');
      }
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
