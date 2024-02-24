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
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useDrawer } from '@/components/Drawer';
  import { hasPermission } from '@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import { deleteSysRoleApi, listSysRoleApi } from '@/api/sys/SysRoleApi';
  import SysRoleDetailDrawer from './detail-drawer.vue';
  import SysRoleUpdateDrawer from './update-drawer.vue';
  import BindMenuDrawer from './bind-menu-drawer.vue';
  import { TreeItem } from '@/components/Tree';
  import { listAllMenuApi } from '@/api/sys/SysMenuApi';
  import { RouteItem } from '@/api/sys/model/menuModel';
  import { menu2Tree } from '@/api/sys/menu';

  // 查看详情
  const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  // 新增/编辑
  const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
  // 绑定角色
  const [registerBindMenuDrawer, { openDrawer: openBindMenuDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    title: '角色管理',
    api: listSysRoleApi,
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

  // 预加载：菜单树形框
  const menuTreeData = ref<TreeItem[]>([]);
  const hasChildMenuMap = ref<Map<string, boolean>>(new Map<string, boolean>());

  async function fetchMenuTreeData() {
    const apiResult: RouteItem[] = await listAllMenuApi();
    menuTreeData.value = menu2Tree(apiResult) as unknown as TreeItem[];

    const newHasChildMenuMap = new Map<string, boolean>();
    apiResult.forEach((item) => {
      newHasChildMenuMap.set(item.parentId, true);
    });
    hasChildMenuMap.value = newHasChildMenuMap;
  }

  fetchMenuTreeData();

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
    await deleteSysRoleApi([record.id]);
    await reload();
  }

  /**
   * 编辑成功后事件
   */
  function handleSuccess() {
    reload();
  }

  /**
   * 单击绑定菜单按钮事件
   */
  function handleBindMenus(record: Recordable) {
    openBindMenuDrawer(true, {
      record,
      menuTreeData,
      hasChildMenuMap,
    });
  }
</script>
