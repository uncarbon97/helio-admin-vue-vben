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
  import { updateBookBorrowingApi, createBookBorrowingApi } from '/@/api/library/BookBorrowingApi';
  import { insertOrUpdateFormSchema, getBookObjectMap, getMemberObjectMap } from './data';

  export default defineComponent({
    name: 'BookBorrowingUpdateDrawer',
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
          setDrawerProps({ confirmLoading: true });

          /*
          提交时由前端提交会员的详细信息
           */
          const memberInfo = getMemberObjectMap().get(values.memberId);
          values.memberUsername = memberInfo?.username;
          values.memberRealName = memberInfo?.realName;

          /*
          提交时由前端提交书籍的详细信息
           */
          const bookInfo = getBookObjectMap().get(values.bookId);
          values.bookTitle = bookInfo?.title;
          values.bookIsbn = bookInfo?.isbn;

          // 约定归还时间需要处理成只有日期部分
          values.appointedReturnAt = values.appointedReturnAt.format('YYYY-MM-DD');

          if (recordId) {
            await updateBookBorrowingApi(recordId, values);
          } else {
            await createBookBorrowingApi(values);
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
