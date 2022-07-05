<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button v-if="hasPermission('SysParam:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              show: hasPermission('SysParam:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              show: hasPermission('SysParam:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              show: hasPermission('SysParam:delete'),
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
    <SysParamDetailDrawer @register="registerDetailDrawer" />
    <SysParamUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { hasPermission } from '/@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import { deleteSysParamApi, listSysParamApi } from '/@/api/sys/SysParamApi';
  import SysParamDetailDrawer from './detail-drawer.vue';
  import SysParamUpdateDrawer from './update-drawer.vue';

  export default defineComponent({
    name: 'SysParamIndex',
    components: { BasicTable, TableAction, SysParamDetailDrawer, SysParamUpdateDrawer },
    setup() {
      // 查看详情
      const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
      // 新增/编辑
      const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
      const [registerTable, { reload }] = useTable({
        title: '系统参数',
        api: listSysParamApi,
        columns,
        formConfig: {
          labelWidth: 80,
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

      function handleRetrieveDetail(record: Recordable) {
        openDetailDrawer(true, { record });
      }

      function handleInsert() {
        openUpdateDrawer(true, {
          isUpdateView: false,
        });
      }

      function handleUpdate(record: Recordable) {
        openUpdateDrawer(true, {
          record,
          isUpdateView: true,
        });
      }

      async function handleDelete(record: Recordable) {
        await deleteSysParamApi([record.id]);
        await reload();
      }

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
