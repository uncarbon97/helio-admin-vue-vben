<template>
  <div>
    <BasicTable @register="registerTable"/>
  </div>
</template>
<script lang="ts" setup>
import {BasicTable, useTable} from '@/components/Table';
import {columns, queryFormSchema} from './data';
import {listSysLogApi} from '@/api/sys/SysLogApi';

const [registerTable] = useTable({
  title: '系统日志',
  api: listSysLogApi,
  columns,
  formConfig: {
    labelWidth: 120,
    schemas: queryFormSchema,
  },
  useSearchForm: true,
  showTableSetting: true,
  bordered: true,
  showIndexColumn: false,
});
</script>
