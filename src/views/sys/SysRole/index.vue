<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    新增按钮    -->
        <a-button v-if="hasPermission('SysRole:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
          :actions="[
            {
              tooltip: '详情',
              ifShow: hasPermission('SysRole:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              tooltip: '编辑',
              ifShow: hasPermission('SysRole:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              tooltip: '绑定菜单',
              ifShow: hasPermission('SysRole:bindMenus'),
              icon: 'ant-design:setting-outlined',
              onClick: handleBindMenus.bind(null, record),
            },
            {
              tooltip: '删除',
              ifShow: hasPermission('SysRole:delete'),
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
    <SysRoleDetailDrawer @register="registerDetailDrawer" />
    <!--  编辑侧边抽屉  -->
    <SysRoleUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
    <!--  绑定菜单侧边抽屉  -->
    <BindMenuDrawer @register="registerBindMenuDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { hasPermission } from '/@/utils/auth';
  import { columns, getMenuTreeData, queryFormSchema, refreshMenuTreeData } from './data';
  import { deleteSysRoleApi, listSysRoleApi } from '/@/api/sys/SysRoleApi';
  import SysRoleDetailDrawer from './detail-drawer.vue';
  import SysRoleUpdateDrawer from './update-drawer.vue';
  import BindMenuDrawer from './bind-menu-drawer.vue';

  export default defineComponent({
    name: 'SysRoleIndex',
    components: {
      BasicTable,
      TableAction,
      SysRoleDetailDrawer,
      SysRoleUpdateDrawer,
      BindMenuDrawer,
    },
    setup() {
      // 查看详情
      const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
      // 新增/编辑
      const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
      // 绑定角色
      const [registerBindMenuDrawer, { openDrawer: openBindMenuDrawer }] = useDrawer();
      const [registerTable, { reload }] = useTable({
        title: '后台角色',
        api: listSysRoleApi,
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
        await deleteSysRoleApi([record.id]);
        await reload();
      }

      function handleSuccess() {
        reload();
      }

      function handleBindMenus(record: Recordable) {
        openBindMenuDrawer(true, {
          record,
          menuTreeData: getMenuTreeData(),
        });
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
        registerBindMenuDrawer,
        handleBindMenus,
      };
    },
    mounted() {
      refreshMenuTreeData();
    },
  });
</script>
