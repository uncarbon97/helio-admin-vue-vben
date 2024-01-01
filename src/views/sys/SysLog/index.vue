<template>
  <div>
    <BasicTable @register="registerTable" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, useTable } from '@/components/Table';
  import { columns, queryFormSchema } from './data';
  import { listSysLogApi } from '@/api/sys/SysLogApi';

  export default defineComponent({
    name: 'SysLogIndex',
    components: { BasicTable },
    setup() {
      const [registerTable, { reload }] = useTable({
        title: '后台操作日志',
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

      function handleSuccess() {
        reload();
      }

      return {
        registerTable,
        handleSuccess,
      };
    },
  });
</script>
