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
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { updateBookApi, createBookApi } from '/@/api/library/BookApi';
  import { insertOrUpdateFormSchema } from './data';

  export default defineComponent({
    name: 'BookUpdateDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdateView = ref(true);
      let recordId: string;

      const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
        labelCol: {
          span: 4,
        },
        wrapperCol: {
          span: 24 - 4,
        },
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
          // values 的字段定义见 ./data.ts 的 insertOrUpdateFormSchema
          const values = await validate();

          // 如果上传了封面图片，则赋值封面图片字段
          if (values.coverImgUpload && values.coverImgUpload.length >= 1) {
            values.coverImgUrl = values.coverImgUpload[0];
            // 避免多余字段一并发送
            delete values.coverImgUpload;
          }

          setDrawerProps({ confirmLoading: true });

          if (recordId) {
            await updateBookApi(recordId, values);
          } else {
            await createBookApi(values);
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
