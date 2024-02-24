<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="查看详情" width="40%">
    <Description
      size="large"
      title=""
      :bordered="true"
      :column="1"
      :data="record"
      :schema="retrieveDetailFormSchema"
    />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { Description } from '@/components/Description';
  import { retrieveDetailFormSchema } from './data';
  import { retrieveSysRoleApi } from '@/api/sys/SysRoleApi';

  const record = ref({});

  const [registerDrawer] = useDrawerInner(async (data) => {
    record.value = await retrieveSysRoleApi(data.record.id);
  });
</script>
