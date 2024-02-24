<template>
  <div class="m-4 mr-0 overflow-hidden bg-white">
    <BasicTree
      title="部门列表"
      toolbar
      search
      treeWrapperClassName="h-[calc(100%-35px)] overflow-auto"
      :clickRowToExpand="false"
      :treeData="treeData"
      :fieldNames="{ key: 'id', title: 'name' }"
      @select="handleSelect"
    />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTree } from '@/components/Tree';
  import { useSysDeptSelectOptions } from '@/api/select-options/hooks/useSelectOptions';

  defineOptions({ name: 'DeptTree' });

  const { sysDeptSelectOptions: treeData, fetchSysDeptSelectOptions } = useSysDeptSelectOptions();
  fetchSysDeptSelectOptions();

  const emit = defineEmits(['select']);

  function handleSelect(keys) {
    emit('select', keys[0]);
  }
</script>
