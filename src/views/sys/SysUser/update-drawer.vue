<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="40%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { insertOrUpdateFormSchema } from '@/views/sys/SysUser/data';
  import { createSysUserApi, updateSysUserApi } from '@/api/sys/SysUserApi';
  import { DEFAULT_TREE_SELECT_FIELD_NAMES } from '@/helio/constants/fieldNamesConstant';

  const isUpdateView = ref(true);
  let recordId: string;
  const getTitle = computed(() => (!unref(isUpdateView) ? '新增' : '编辑'));

  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 24 - 4,
    },
    // Helio: 相较于 Vben 2.3.0 版本，需要添加下面这行来修正样式
    baseColProps: { span: 24 },
    schemas: insertOrUpdateFormSchema,
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

    // 主键ID
    recordId = data.record?.id || null;

    // 列表页透传的部门下拉框数据
    const deptIdTreeData = data.sysDeptSelectOptions;
    await updateSchema({
      field: 'deptId',
      componentProps: {
        treeData: deptIdTreeData,
        fieldNames: DEFAULT_TREE_SELECT_FIELD_NAMES,
      },
    });

    // 列表页透传的默认选中部门ID
    const selectedDeptId = data.selectedDeptId;
    if (selectedDeptId) {
      setFieldsValue({
        deptId: selectedDeptId,
      });
    }
  });

  const emit = defineEmits(['success']);

  async function handleSubmit() {
    try {
      // values 的字段定义见 ./data.ts 的 insertOrUpdateFormSchema
      const values = await validate();
      setDrawerProps({ confirmLoading: true });

      if (recordId) {
        await updateSysUserApi(recordId, values);
      } else {
        await createSysUserApi(values);
      }

      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
