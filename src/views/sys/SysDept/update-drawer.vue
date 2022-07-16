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
<script lang="ts">
  import { defineComponent, ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { insertOrUpdateFormSchema } from '/@/views/sys/SysDept/data';
  import { createSysDeptApi, listSysDeptApi, updateSysDeptApi } from '/@/api/sys/SysDeptApi';

  export default defineComponent({
    name: 'SysDeptUpdateDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdateView = ref(true);
      let recordId: string;

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

        // 更新上级部门树状数据
        const parentIdTreeData = await listSysDeptApi({});
        await updateSchema({
          field: 'parentId',
          componentProps: {
            treeData: parentIdTreeData,
            replaceFields: {
              title: 'title',
              key: 'id',
              value: 'id',
            },
          },
        });
      });

      const getTitle = computed(() => (!unref(isUpdateView) ? '新增' : '编辑'));

      async function handleSubmit() {
        try {
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

      return { registerDrawer, registerForm, getTitle, handleSubmit };
    },
  });
</script>
