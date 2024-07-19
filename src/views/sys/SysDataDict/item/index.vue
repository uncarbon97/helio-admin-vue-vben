<template>
  <div>
    <BasicDrawer
      v-bind="$attrs"
      @register="registerDrawer"
      showFooter
      title="管理字典项"
      width="70%"
    >
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
                tooltip: '编辑',
                ifShow: hasPermission('SysDataDict:update'),
                icon: 'clarity:note-edit-line',
                onClick: handleUpdate.bind(null, record),
              },
              {
                tooltip: '删除',
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
      <!--  编辑侧边抽屉  -->
      <SysDataDictUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
    </BasicDrawer>
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { BasicDrawer, useDrawer, useDrawerInner } from '@/components/Drawer';
  import { hasPermission } from '@/utils/auth';
  import { columns } from './data';
  import { deleteSysDataDictApi, listSysDataDictApi } from '@/api/sys/SysDataDictApi';
  import SysDataDictUpdateDrawer from './update-drawer.vue';

  let classifiedId: string;
  let classifiedName: string = '';

  // 新增/编辑
  const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    title: classifiedName,
    api: (queryForm) => {
      console.log(classifiedId);
      return listSysDataDictApi(queryForm);
    },
    columns,
    formConfig: {},
    useSearchForm: false,
    showTableSetting: false,
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

  const [registerDrawer] = useDrawerInner((data) => {
    // 外部传入的数据
    classifiedId = data.id;
    classifiedName = data.name;
  });

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
    await deleteSysDataDictApi([record.id]);
    await reload();
  }

  /**
   * 编辑成功后事件
   */
  function handleSuccess() {
    reload();
  }
</script>
