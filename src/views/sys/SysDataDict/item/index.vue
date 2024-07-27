<template>
  <div>
    <BasicDrawer
      v-bind="$attrs"
      @register="registerDrawer"
      showFooter
      :title="classifiedName"
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
  import { deleteSysDataDictItemApi, listSysDataDictItemApi } from '@/api/sys/SysDataDictApi';
  import SysDataDictUpdateDrawer from './update-drawer.vue';
  import { ref } from 'vue';

  const classifiedId = ref<string>('');
  const classifiedName = ref<string>();
  const [registerDrawer] = useDrawerInner((data) => {
    // 外部传入的数据
    const changed = classifiedId.value != data.record?.id;
    classifiedId.value = data.record?.id;
    classifiedName.value = data.record?.name;
    if (changed) {
      reload();
    }
  });

  // 新增/编辑
  const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    title: '',
    api: (queryForm) => {
      return listSysDataDictItemApi(classifiedId.value, queryForm);
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

  /**
   * 单击新增按钮事件
   */
  function handleInsert() {
    openUpdateDrawer(true, {
      isUpdateView: false,
      classifiedId,
    });
  }

  /**
   * 单击编辑按钮事件
   */
  function handleUpdate(record: Recordable) {
    openUpdateDrawer(true, {
      record,
      isUpdateView: true,
      classifiedId,
    });
  }

  /**
   * 单击删除按钮事件
   */
  async function handleDelete(record: Recordable) {
    await deleteSysDataDictItemApi(classifiedId.value, [record.id]);
    await reload();
  }

  /**
   * 编辑成功后事件
   */
  function handleSuccess() {
    reload();
  }
</script>
