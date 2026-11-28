<script lang="ts" setup>
import type { DeptOptionNode } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Card, Empty, Input, Tree } from 'antdv-next';

import { buildDeptOptionTree, getDeptSelectOptions } from '#/api';
import { $t } from '#/locales';

defineOptions({ name: 'DeptTreeCard' });

const emit = defineEmits<{
  /**
   * 选中部门变化
   * @param deptId 部门ID，选中"全部"时为 null
   */
  (e: 'select', deptId: null | string): void;
}>();

const ALL_DEPT_KEY = '';
const deptTreeData = ref<DeptOptionNode[]>([]);
const selectedKeys = ref<string[]>([ALL_DEPT_KEY]);
const deptSearchKeyword = ref('');

onMounted(async () => {
  const tree = buildDeptOptionTree(await getDeptSelectOptions());
  deptTreeData.value = [
    {
      id: ALL_DEPT_KEY,
      name: $t('sys.user.allUsers'),
      children: tree,
    },
  ];
});

/** 按关键词过滤部门树（保留命中节点的祖先链） */
const filteredDeptTree = computed<DeptOptionNode[]>(() => {
  const keyword = deptSearchKeyword.value.trim();
  if (!keyword) return deptTreeData.value;

  const filter = (nodes: DeptOptionNode[]): DeptOptionNode[] => {
    const result: DeptOptionNode[] = [];
    nodes.forEach((node) => {
      const children = node.children ? filter(node.children) : undefined;
      if (node.name.includes(keyword) || children?.length) {
        result.push({ ...node, children });
      }
    });
    return result;
  };
  return filter(deptTreeData.value);
});

function onTreeSelect(keys: (number | string)[]) {
  const key = String(keys[0] ?? ALL_DEPT_KEY);
  selectedKeys.value = [key];
  emit('select', key === ALL_DEPT_KEY ? null : key);
}
</script>
<template>
  <Card
    class="h-full w-full"
    :body-style="{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }"
  >
    <div class="mb-2 shrink-0">
      <Input
        v-model:value="deptSearchKeyword"
        allow-clear
        :placeholder="$t('sys.dept.searchPlaceholder')"
        size="small"
      />
    </div>
    <div class="min-h-0 flex-1 overflow-auto">
      <Tree
        v-model:selected-keys="selectedKeys"
        :field-names="{ children: 'children', key: 'id', title: 'name' }"
        :tree-data="filteredDeptTree"
        block-node
        default-expand-all
        @select="onTreeSelect"
      />
      <Empty
        v-if="filteredDeptTree.length === 0"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        class="py-8"
      />
    </div>
  </Card>
</template>
