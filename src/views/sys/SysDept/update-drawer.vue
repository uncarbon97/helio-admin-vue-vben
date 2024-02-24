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
  import { BasicForm, useForm } from '@/components/Form';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { insertOrUpdateFormSchema } from '@/views/sys/SysDept/data';
  import { createSysDeptApi, listSysDeptApi, updateSysDeptApi } from '@/api/sys/SysDeptApi';
  import { DEFAULT_TREE_SELECT_FIELD_NAMES } from '@/helio/constants/fieldNamesConstant';

  const isUpdateView = ref(true);
  let recordId: string;
  const getTitle = computed(() => (!unref(isUpdateView) ? '新增' : '编辑'));

  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    /*
    如果想要两项在同一行的话, 移除labelCol、wrapperCol, 改用以下两行样式
    labelWidth: 100,
    baseColProps: {lg: 12, md: 24},
    */
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

    // 加载：部门下拉框数据
    const parentIdTreeData = await listSysDeptApi();
    await updateSchema({
      field: 'parentId',
      componentProps: {
        treeData: parentIdTreeData,
        fieldNames: DEFAULT_TREE_SELECT_FIELD_NAMES,
      },
    });
  });

  const emit = defineEmits(['success']);

  async function handleSubmit() {
    try {
      // values 的字段定义见 ./data.ts 的 insertOrUpdateFormSchema
      const values = await validate();
      setDrawerProps({ confirmLoading: true });

      if (recordId) {
        await updateSysDeptApi(recordId, values);
      } else {
        await createSysDeptApi(values);
      }

      closeDrawer();
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
