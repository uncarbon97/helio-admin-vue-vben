<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    新增按钮    -->
        <a-button v-if="hasPermission('SysUser:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
        <!--    重置密码按钮    -->
        <a-button
          v-if="hasPermission('SysUser:resetPassword')"
          type="primary"
          @click="handleResetPassword"
        >
          重置密码
        </a-button>
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
          :actions="[
            {
              tooltip: '详情',
              ifShow: hasPermission('SysUser:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              tooltip: '编辑',
              ifShow: hasPermission('SysUser:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              tooltip: '绑定角色',
              ifShow: hasPermission('SysUser:bindRoles'),
              icon: 'ant-design:setting-outlined',
              onClick: handleBindRole.bind(null, record),
            },
            {
              tooltip: '删除',
              ifShow: hasPermission('SysUser:delete'),
              icon: 'ant-design:delete-outlined',
              color: 'error',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
            {
              tooltip: '强制踢下线',
              ifShow: hasPermission('SysUser:kickOut'),
              icon: 'ant-design:disconnect-outlined',
              color: 'error',
              popConfirm: {
                title: '是否确认强制踢下线',
                confirm: handleKickOut.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <!--  详情侧边抽屉  -->
    <SysUserDetailDrawer @register="registerDetailDrawer" />
    <!--  编辑侧边抽屉  -->
    <SysUserUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
    <!--  绑定角色侧边抽屉  -->
    <BindRoleDrawer @register="registerBindRoleDrawer" @success="handleSuccess" />
    <!--  重置密码确认弹窗  -->
    <ResetPasswordConfirmModal @register="registerResetPasswordConfirmModal" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useDrawer } from '@/components/Drawer';
  import { hasPermission } from '@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import { kickOutSysUserApi, deleteSysUserApi, listSysUserApi } from '@/api/sys/SysUserApi';
  import SysUserDetailDrawer from './detail-drawer.vue';
  import SysUserUpdateDrawer from './update-drawer.vue';
  import BindRoleDrawer from './bind-role-drawer.vue';
  import ResetPasswordConfirmModal from './reset-password/confirm-modal.vue';
  import { notification } from 'ant-design-vue';
  import { useModal } from '@/components/Modal';
  import { useSysRoleSelectOptions } from '@/hooks/api/useSelectOptions';

  export default defineComponent({
    name: 'SysUserIndex',
    components: {
      BasicTable,
      TableAction,
      SysUserDetailDrawer,
      SysUserUpdateDrawer,
      BindRoleDrawer,
      ResetPasswordConfirmModal,
    },
    setup() {
      // 查看详情
      const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
      // 新增/编辑
      const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
      // 绑定角色
      const [registerBindRoleDrawer, { openDrawer: openBindRoleDrawer }] = useDrawer();
      // 重置密码确认弹窗
      const [registerResetPasswordConfirmModal, { openModal: openResetPasswordConfirmModal }] =
        useModal();

      const [registerTable, { reload, getSelectRows }] = useTable({
        title: '后台用户',
        api: listSysUserApi,
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
          width: 130,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
          fixed: undefined,
        },
        rowSelection: {
          type: 'checkbox',
        },
      });

      // 预加载：角色下拉框数据
      const { sysRoleSelectOptions, getSysRoleSelectOptions } = useSysRoleSelectOptions();
      getSysRoleSelectOptions();

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
        await deleteSysUserApi([record.id]);
        await reload();
      }

      function handleSuccess() {
        reload();
      }

      async function handleResetPassword() {
        const records = getSelectRows();
        if (records.length < 1) {
          notification.error({
            message: '错误',
            description: '请选择一条数据',
            duration: 2,
          });
          return;
        }

        if (records.length > 1) {
          notification.error({
            message: '错误',
            description: '只能选一条数据',
            duration: 2,
          });
          return;
        }

        // 将选中行数据传入模态框
        const record = records[0];
        openResetPasswordConfirmModal(true, {
          record,
        });
      }

      function handleBindRole(record: Recordable) {
        openBindRoleDrawer(true, {
          record,
          isUpdateView: true,
          sysRoleSelectOptions,
        });
      }

      async function handleKickOut(record: Recordable) {
        await kickOutSysUserApi(record.id);
        notification.success({
          message: '成功',
          description: '已强制踢下线',
          duration: 3,
        });
      }

      return {
        hasPermission,
        registerTable,
        registerDetailDrawer,
        registerUpdateDrawer,
        registerBindRoleDrawer,
        registerResetPasswordConfirmModal,
        handleRetrieveDetail,
        handleInsert,
        handleUpdate,
        handleDelete,
        handleSuccess,
        handleResetPassword,
        handleBindRole,
        handleKickOut,
      };
    },
  });
</script>
