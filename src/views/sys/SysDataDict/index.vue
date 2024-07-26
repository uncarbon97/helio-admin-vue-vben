<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    新增按钮    -->
        <a-button v-if="hasPermission('SysDataDict:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
          :actions="[
            {
              tooltip: '管理字典项',
              ifShow: hasPermission('SysDataDict:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              tooltip: '编辑分类',
              ifShow: hasPermission('SysDataDict:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              tooltip: '删除分类',
              ifShow: hasPermission('SysDataDict:delete'),
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
    <SysDataDictItemIndex @register="registerItemDrawer" />
    <!--  编辑侧边抽屉  -->
    <SysDataDictUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useDrawer } from '@/components/Drawer';
  import { hasPermission } from '@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import {
    deleteSysDataDictClassifiedApi,
    listSysDataDictClassifiedApi,
  } from '@/api/sys/SysDataDictApi';
  import SysDataDictItemIndex from './item/index.vue';
  import SysDataDictUpdateDrawer from './update-drawer.vue';

  // 查看详情
  const [registerItemDrawer, { openDrawer: openItemDrawer }] = useDrawer();
  // 新增/编辑
  const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    title: '数据字典',
    api: listSysDataDictClassifiedApi,
    columns,
    formConfig: {
      /*
      列表查询条件
       */
      // 输入框左侧标题的宽度
      labelWidth: 120,
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
    openItemDrawer(true, { record });
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
    await deleteSysDataDictClassifiedApi([record.id]);
    await reload();
  }

  /**
   * 编辑成功后事件
   */
  function handleSuccess() {
    reload();
  }
</script>
