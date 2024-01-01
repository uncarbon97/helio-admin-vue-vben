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
  import { BasicForm, useForm } from '@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { insertOrUpdateFormSchema } from '@/views/sys/SysMenu/data';
  import { createSysMenuApi, listSysMenuApi, updateSysMenuApi } from '@/api/sys/SysMenuApi';
  import { DEFAULT_TREE_SELECT_FIELD_NAMES } from '@/helio/constants/fieldNamesConstant';

  export default defineComponent({
    name: 'SysMenuUpdateDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdateView = ref(true);
      let recordId: string;

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

        // 更新上级菜单树状数据
        const parentIdTreeData = await listSysMenuApi();
        await updateSchema({
          field: 'parentId',
          componentProps: {
            treeData: parentIdTreeData,
            fieldNames: DEFAULT_TREE_SELECT_FIELD_NAMES,
          },
        });
      });

      const getTitle = computed(() => (!unref(isUpdateView) ? '新增' : '编辑'));

      async function handleSubmit() {
        try {
          // values 的字段定义见 ./data.ts 的 insertOrUpdateFormSchema
          const values = await validate();
          setDrawerProps({ confirmLoading: true });

          if (recordId) {
            await updateSysMenuApi(recordId, values);
          } else {
            await createSysMenuApi(values);
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
