<template>
  <div>
    <BasicTable @register="registerTable" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable } from '@/components/Table';
  import { columns, queryFormSchema } from './data';
  import { listSysLogApi } from '@/api/sys/SysLogApi';

  const [registerTable] = useTable({
    title: '系统日志',
    api: listSysLogApi,
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
  });
</script>
