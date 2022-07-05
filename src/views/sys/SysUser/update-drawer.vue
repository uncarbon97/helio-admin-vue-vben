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
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { insertOrUpdateFormSchema } from '/@/views/sys/SysUser/data';
  import { createSysUserApi, updateSysUserApi } from '/@/api/sys/SysUserApi';
  import { listSysDeptApi } from '/@/api/sys/SysDeptApi';

  export default defineComponent({
    name: 'SysUserUpdateDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdateView = ref(true);
      let recordId: string;

      const [
        registerForm,
        {
          resetFields,
          setFieldsValue,
          updateSchema,
          validate,
          getFieldsValue,
          clearValidate,
          validateFields,
        },
      ] = useForm({
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

        // 更新部门树状数据
        const deptIdTreeData = await listSysDeptApi({});
        await updateSchema({
          field: 'deptId',
          componentProps: {
            treeData: deptIdTreeData,
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
          let fieldKeys = Object.keys(getFieldsValue());
          console.log('helio: fieldKeys', fieldKeys);
          console.log('helio: validateFields', await validateFields(fieldKeys));

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

      return { registerDrawer, registerForm, getTitle, handleSubmit };
    },
  });
</script>
