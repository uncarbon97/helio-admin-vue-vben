<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!--    不允许新增    -->
      </template>
      <template #action="{ record }">
        <!--   每行最右侧一列的工具栏   -->
        <TableAction
          :actions="[
            {
              tooltip: '详情',
              ifShow: hasPermission('OssFileInfo:retrieve'),
              icon: 'ant-design:eye-outlined',
              onClick: handleRetrieveDetail.bind(null, record),
            },
            // 不允许编辑
            {
              tooltip: '删除',
              ifShow: hasPermission('OssFileInfo:delete'),
              icon: 'ant-design:delete-outlined',
              color: 'error',
              popConfirm: {
                title: '是否确认删除',
                confirm: handleDelete.bind(null, record),
              },
            },
            {
              tooltip: '下载',
              ifShow: hasPermission('OssFileInfo:retrieve'),
              icon: 'ant-design:download-outlined',
              onClick: handleDownload.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <!--  详情侧边抽屉  -->
    <OssFileInfoDetailDrawer @register="registerDetailDrawer" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useDrawer } from '@/components/Drawer';
  import { hasPermission } from '@/utils/auth';
  import { columns, queryFormSchema } from './data';
  import {
    deleteOssFileInfoApi,
    downloadOssFileApi,
    listOssFileInfoApi,
  } from '@/api/oss/OssFileInfoApi';
  import OssFileInfoDetailDrawer from './detail-drawer.vue';

  // 查看详情
  const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    title: '上传文件信息',
    api: listOssFileInfoApi,
    columns,
    formConfig: {
      /*
    列表查询条件
     */
      // 输入框左侧标题的宽度
      labelWidth: 100,
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
    openDetailDrawer(true, { record });
  }

  /**
   * 单击删除按钮事件
   */
  async function handleDelete(record: Recordable) {
    await deleteOssFileInfoApi([record.id]);
    await reload();
  }

  /**
   * 单击下载按钮事件
   */
  function handleDownload(record: Recordable) {
    downloadOssFileApi(record.id);
  }
</script>
