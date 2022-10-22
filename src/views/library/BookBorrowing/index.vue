<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    新增按钮    -->
        <a-button v-if="hasPermission('BookBorrowing:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
          :actions="[
            {
              tooltip: '详情',
              ifShow: hasPermission('BookBorrowing:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            // 不允许编辑
            {
              tooltip: '删除',
              ifShow: hasPermission('BookBorrowing:delete'),
              icon: 'ant-design:delete-outlined',
              color: 'error',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
            {
              tooltip: '确认归还',
              ifShow: hasPermission('BookBorrowing:return'),
              icon: 'ant-design:retweet-outlined',
              popConfirm: {
                title: '是否确认书籍归还',
                confirm: handleReturn.bind(null, record),
              },
              ifShow: record.status !== 2,
            },
          ]"
        />
      </template>
    </BasicTable>
    <!--  详情侧边抽屉  -->
    <BookBorrowingDetailDrawer @register="registerDetailDrawer" />
    <!--  编辑侧边抽屉  -->
    <BookBorrowingUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { hasPermission } from '/@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import {
    deleteBookBorrowingApi,
    listBookBorrowingApi,
    returnBookBorrowingApi,
  } from '/@/api/library/BookBorrowingApi';
  import BookBorrowingDetailDrawer from './detail-drawer.vue';
  import BookBorrowingUpdateDrawer from './update-drawer.vue';

  export default defineComponent({
    name: 'BookBorrowingIndex',
    components: { BasicTable, TableAction, BookBorrowingDetailDrawer, BookBorrowingUpdateDrawer },
    setup() {
      // 查看详情
      const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
      // 新增/编辑
      const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
      const [registerTable, { reload }] = useTable({
        title: '书籍借阅记录',
        api: listBookBorrowingApi,
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
        await deleteBookBorrowingApi([record.id]);
        await reload();
      }

      /**
       * 单击确认归还按钮事件
       */
      async function handleReturn(record: Recordable) {
        await returnBookBorrowingApi(record.id);
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
        handleReturn,
      };
    },
    mounted() {
      console.warn('Helio: 解禁以下代码，可以实现每次切换到本页面时，都重新加载书籍列表、会员列表');
      // updateBook();
      // updateMember();
    },
  });
</script>
