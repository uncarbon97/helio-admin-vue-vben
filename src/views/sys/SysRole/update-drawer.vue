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
  import { insertOrUpdateFormSchema } from '/@/views/sys/SysRole/data';
  import { createSysRoleApi, updateSysRoleApi } from '/@/api/sys/SysRoleApi';

  export default defineComponent({
    name: 'SysRoleUpdateDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup: function (_, { emit }) {
      const isUpdateView = ref(true);
      let recordId: string;

      const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
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
      });

      const getTitle = computed(() => (!unref(isUpdateView) ? '新增' : '编辑'));

      async function handleSubmit() {
        try {
          const values = await validate();

          setDrawerProps({ confirmLoading: true });

          if (recordId) {
            await updateSysRoleApi(recordId, values);
          } else {
            await createSysRoleApi(values);
          }

          closeDrawer();
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }

      return {
        registerDrawer,
        registerForm,
        getTitle,
        handleSubmit,
      };
    },
  });
</script>
