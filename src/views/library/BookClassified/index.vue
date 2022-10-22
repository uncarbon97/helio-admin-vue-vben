<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    新增按钮    -->
        <a-button
          v-if="hasPermission('BookClassified:create')"
          type="primary"
          @click="handleInsert"
        >
          新增
        </a-button>
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
          :actions="[
            {
              tooltip: '详情',
              ifShow: hasPermission('BookClassified:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              tooltip: '编辑',
              ifShow: hasPermission('BookClassified:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              tooltip: '删除',
              ifShow: hasPermission('BookClassified:delete'),
              icon: 'ant-design:delete-outlined',
              color: 'error',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <!--  详情侧边抽屉  -->
    <BookClassifiedDetailDrawer @register="registerDetailDrawer" />
    <!--  编辑侧边抽屉  -->
    <BookClassifiedUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { hasPermission } from '/@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import { deleteBookClassifiedApi, listBookClassifiedApi } from '/@/api/library/BookClassifiedApi';
  import BookClassifiedDetailDrawer from './detail-drawer.vue';
  import BookClassifiedUpdateDrawer from './update-drawer.vue';
  import { list2Tree } from '/@/helio/converter/bizDataStructConverter';

  export default defineComponent({
    name: 'BookClassifiedIndex',
    components: { BasicTable, TableAction, BookClassifiedDetailDrawer, BookClassifiedUpdateDrawer },
    setup() {
      // 查看详情
      const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
      // 新增/编辑
      const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
      const [registerTable, { reload }] = useTable({
        title: '书籍类别',
        api: async () => {
          // 转成树结构
          return list2Tree(await listBookClassifiedApi());
        },
        columns,
        formConfig: {
          /*
          列表查询条件
           */
          // 输入框左侧标题的宽度
          labelWidth: 100,
          // 查询条件配置
          schemas: queryFormSchema,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
        actionColumn: {
          width: 80,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
          fixed: undefined,
        },
      });

      /**
       * 单击详情按钮事件
       */
      function handleRetrieveDetail(record: Recordable) {
        openDetailDrawer(true, { record });
      }

      /**
       * 单击新增按钮事件
       */
      function handleInsert() {
        openUpdateDrawer(true, {
          isUpdateView: false,
        });
      }

      /**
       * 单击编辑按钮事件
       */
      function handleUpdate(record: Recordable) {
        openUpdateDrawer(true, {
          record,
          isUpdateView: true,
        });
      }

      /**
       * 单击删除按钮事件
       */
      async function handleDelete(record: Recordable) {
        await deleteBookClassifiedApi([record.id]);
        await reload();
      }

      /**
       * 编辑成功后事件
       */
      function handleSuccess() {
        reload();
      }

      return {
        hasPermission,
        registerTable,
        registerDetailDrawer,
        registerUpdateDrawer,
        handleRetrieveDetail,
        handleInsert,
        handleUpdate,
        handleDelete,
        handleSuccess,
      };
    },
  });
</script>
