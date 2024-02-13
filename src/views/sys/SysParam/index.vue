<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    新增按钮    -->
        <a-button v-if="hasPermission('SysParam:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
            :actions="[
            {
              tooltip: '详情',
              ifShow: hasPermission('SysParam:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              tooltip: '编辑',
              ifShow: hasPermission('SysParam:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              tooltip: '删除',
              ifShow: hasPermission('SysParam:delete'),
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
    <SysParamDetailDrawer @register="registerDetailDrawer"/>
    <!--  编辑侧边抽屉  -->
    <SysParamUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess"/>
  </div>
</template>
<script lang="ts" setup>
import {BasicTable, TableAction, useTable} from '@/components/Table';
import {useDrawer} from '@/components/Drawer';
import {hasPermission} from '@/utils/auth';
import {columns, queryFormSchema} from './data';
import {deleteSysParamApi, listSysParamApi} from '@/api/sys/SysParamApi';
import SysParamDetailDrawer from './detail-drawer.vue';
import SysParamUpdateDrawer from './update-drawer.vue';

// 查看详情
const [registerDetailDrawer, {openDrawer: openDetailDrawer}] = useDrawer();
// 新增/编辑
const [registerUpdateDrawer, {openDrawer: openUpdateDrawer}] = useDrawer();
const [registerTable, {reload}] = useTable({
  title: '参数管理',
  api: listSysParamApi,
  columns,
  formConfig: {
    labelWidth: 120,
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
    slots: {customRender: 'action'},
    fixed: undefined,
  },
});

function handleRetrieveDetail(record: Recordable) {
  openDetailDrawer(true, {record});
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
</script>
