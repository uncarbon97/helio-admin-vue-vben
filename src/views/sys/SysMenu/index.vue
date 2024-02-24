<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    新增按钮    -->
        <a-button v-if="hasPermission('SysMenu:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
          :actions="[
            {
              tooltip: '详情',
              ifShow: hasPermission('SysMenu:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              tooltip: '新增下级菜单',
              ifShow: hasPermission('SysMenu:create'),
              icon: 'ant-design:plus-outlined',
              onClick: handleInsert.bind(null, record),
            },
            {
              tooltip: '编辑',
              ifShow: hasPermission('SysMenu:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              tooltip: '删除',
              ifShow: hasPermission('SysMenu:delete'),
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
    <SysMenuDetailDrawer @register="registerDetailDrawer" />
    <!--  编辑侧边抽屉  -->
    <SysMenuUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '@/components/Table';
  import { useDrawer } from '@/components/Drawer';
  import { hasPermission } from '@/utils/auth';
  import { columns } from './data';
  import { deleteSysMenuApi, listSysMenuApi } from '@/api/sys/SysMenuApi';
  import SysMenuDetailDrawer from './detail-drawer.vue';
  import SysMenuUpdateDrawer from './update-drawer.vue';

  // 查看详情
  const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  // 新增/编辑
  const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    title: '菜单管理',
    api: listSysMenuApi,
    columns,
    // 不显示查询条件
    useSearchForm: false,
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
    pagination: false,
    striped: false,
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
  function handleInsert(record?: Recordable) {
    openUpdateDrawer(true, {
      isUpdateView: false,
      parent: record ?? null,
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
    await deleteSysMenuApi([record.id]);
    await reload();
  }

  /**
   * 编辑成功后事件
   */
  function handleSuccess() {
    reload();
  }
</script>
