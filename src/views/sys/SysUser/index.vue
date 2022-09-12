<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button v-if="hasPermission('SysUser:create')" type="primary" @click="handleInsert">
          新增
        </a-button>
        <a-button
          v-if="hasPermission('SysUser:resetPassword')"
          type="primary"
          @click="handleResetPassword"
        >
          重置密码
        </a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              show: hasPermission('SysUser:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            {
              show: hasPermission('SysUser:update'),
              icon: 'clarity:note-edit-line',
              onClick: handleUpdate.bind(null, record),
            },
            {
              show: hasPermission('SysUser:bindRoles'),
              icon: 'ant-design:setting-outlined',
              onClick: handleBindRole.bind(null, record),
            },
            {
              show: hasPermission('SysUser:delete'),
              icon: 'ant-design:delete-outlined',
              color: 'error',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
            {
              show: hasPermission('SysUser:kickOut'),
              icon: 'ant-design:disconnect-outlined',
              color: 'error',
              popConfirm: {
                title: '是否强制踢下线',
                confirm: handleKickOut.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <SysUserDetailDrawer @register="registerDetailDrawer" />
    <SysUserUpdateDrawer @register="registerUpdateDrawer" @success="handleSuccess" />
    <BindRoleDrawer @register="registerBindRoleDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { hasPermission } from '/@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import {
    deleteSysUserApi,
    kickOutSysUserApi,
    listSysUserApi,
    resetSysUserPasswordApi,
  } from '/@/api/sys/SysUserApi';
  import SysUserDetailDrawer from './detail-drawer.vue';
  import SysUserUpdateDrawer from './update-drawer.vue';
  import BindRoleDrawer from './bind-role-drawer.vue';
  import { notification } from 'ant-design-vue';

  export default defineComponent({
    name: 'SysUserIndex',
    components: {
      BasicTable,
      TableAction,
      SysUserDetailDrawer,
      SysUserUpdateDrawer,
      BindRoleDrawer,
    },
    setup() {
      // 查看详情
      const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
      // 新增/编辑
      const [registerUpdateDrawer, { openDrawer: openUpdateDrawer }] = useDrawer();
      // 绑定角色
      const [registerBindRoleDrawer, { openDrawer: openBindRoleDrawer }] = useDrawer();
      const [registerTable, { reload, getSelectRows }] = useTable({
        title: '后台用户',
        api: listSysUserApi,
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

      function handleResetPassword() {
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

        function randomString(length) {
          length = length || 32;
          const str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
            a = str.length;
          let ret = '';
          for (let i = 0; i < length; i++) {
            ret += str.charAt(Math.floor(Math.random() * a));
          }

          return ret;
        }

        const randomPassword = randomString(20);

        resetSysUserPasswordApi({
          userId: records[0].id,
          randomPassword: randomPassword,
        });

        notification.success({
          message: '重置成功',
          description: '新密码:' + randomPassword,
          duration: 10,
        });
      }

      function handleBindRole(record: Recordable) {
        openBindRoleDrawer(true, {
          record,
          isUpdateView: true,
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
