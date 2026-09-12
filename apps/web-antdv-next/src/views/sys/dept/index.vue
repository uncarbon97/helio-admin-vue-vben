<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysDeptApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Empty, Input, message, Radio, RadioGroup } from 'antdv-next';
import { Vue3TreeOrg } from 'vue3-tree-org';
import 'vue3-tree-org/lib/vue3-tree-org.css';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  buildDeptTree,
  deleteDept,
  getDeptDetail,
  getDeptList,
  setDeptStatus,
} from '#/api';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

// 视图切换（列表 / 组织架构图，架构图仅查看）
const viewType = ref<'table' | 'tree'>('table');
// 响应式树数据，列表刷新时同步，供组织架构图渲染
const treeData = ref<SysDeptApi.DeptTreeNode[]>([]);

// 架构图根节点：跟随本地搜索过滤；单根直接用，多根包虚拟根，避免丢部门
const orgRoot = computed<SysDeptApi.DeptTreeNode | null>(() => {
  const nodes = applySearch(treeData.value);
  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0] ?? null;
  return {
    id: '__virtual__',
    name: $t('sys.dept.rootDept'),
    children: nodes,
  } as SysDeptApi.DeptTreeNode;
});

// 部门名称本地搜索关键词 + 全量树缓存（纯前端过滤，不发请求）
const searchName = ref('');
let cachedTree: SysDeptApi.DeptTreeNode[] = [];

/** 按名称过滤树：命中节点保留整棵子树，未命中但子孙命中的保留并继续下钻 */
function filterTree(
  nodes: SysDeptApi.DeptTreeNode[],
  keyword: string,
): SysDeptApi.DeptTreeNode[] {
  const result: SysDeptApi.DeptTreeNode[] = [];
  for (const node of nodes) {
    if (node.name.includes(keyword)) {
      result.push(node);
      continue;
    }
    const children = node.children?.length
      ? filterTree(node.children, keyword)
      : [];
    if (children.length > 0) {
      result.push({ ...node, children });
    }
  }
  return result;
}

/** 收集需要展开的父节点：搜索时全部展开，默认展开 1、2 级节点 */
function collectExpandNodes(
  nodes: SysDeptApi.DeptTreeNode[],
  maxDepth = Number.MAX_SAFE_INTEGER,
  depth = 1,
): SysDeptApi.DeptTreeNode[] {
  const result: SysDeptApi.DeptTreeNode[] = [];
  nodes.forEach((node) => {
    if (depth <= maxDepth && node.children?.length) {
      result.push(
        node,
        ...collectExpandNodes(node.children, maxDepth, depth + 1),
      );
    }
  });
  return result;
}

/** 根据当前关键词对树做本地过滤，返回要展示的记录 */
function applySearch(tree: SysDeptApi.DeptTreeNode[]) {
  const keyword = searchName.value.trim();
  return keyword ? filterTree(tree, keyword) : tree;
}

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(onActionClick, onToggleStatus),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        // 部门无分页：全量拉取后前端构建树，并缓存供本地搜索复用
        query: async () => {
          cachedTree = buildDeptTree(await getDeptList());
          // 同步响应式树数据，供组织架构图视图渲染
          treeData.value = cachedTree;
          // 搜索时展开全部，否则默认展开到 3 级
          gridApi.setGridOptions({
            treeConfig: {
              expandRowKeys: collectExpandNodes(
                cachedTree,
                searchName.value.trim() ? undefined : 2,
              ).map((node) => node.id),
            },
          });
          return { records: applySearch(cachedTree) };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: false,
      zoom: true,
    },
    treeConfig: {
      childrenField: 'children',
      rowField: 'id',
    },
  } as VxeTableGridOptions<SysDeptApi.DeptTreeNode>,
});

function onActionClick(e: OnActionClickParams<SysDeptApi.SysDeptDTO>) {
  switch (e.code) {
    case 'createChild': {
      // 复用新增表单，预选上级为当前行
      formDrawerApi.setData({ parentId: e.row.id }).open();
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

async function onEdit(row: SysDeptApi.SysDeptDTO) {
  // 修改前拉取详情，保证数据为最新
  const detail = await getDeptDetail(row.id);
  formDrawerApi.setData(detail).open();
}

/**
 * 状态开关切换（成功后由 CellSwitch 渲染器行内更新，失败回弹）
 */
async function onToggleStatus(
  row: SysDeptApi.SysDeptDTO,
  newStatus: EnabledStatusEnum,
) {
  await setDeptStatus([row.id], newStatus);
  message.success($t('ui.actionMessage.operationSuccess'));
}

async function onDelete(row: SysDeptApi.SysDeptDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteDept(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.name]),
      key: 'action_process_msg',
    });
    onRefresh();
  } catch {
    hideLoading();
  }
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData(null).open();
}

// 部门名称本地搜索，纯前端过滤缓存数据，不发请求
async function onSearch() {
  if (cachedTree.length === 0) {
    return;
  }
  const keyword = searchName.value.trim();
  const grid = gridApi.grid;
  await grid.reloadData(applySearch(cachedTree));
  // reloadData 后 treeConfig.expandRowKeys 不会重新生效，需显式展开
  await (keyword
    ? grid.setAllTreeExpand(true)
    : grid.setTreeExpand(collectExpandNodes(cachedTree, 2), true));
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <div class="dept-page">
      <!-- 视图切换独立于表格工具栏之外，架构图视图下仍可切回列表 -->
      <RadioGroup
        v-model:value="viewType"
        type="button"
        button-style="solid"
        size="small"
        class="mb-2 shrink-0"
      >
        <Radio value="table">{{ $t('sys.dept.viewTable') }}</Radio>
        <Radio value="tree">{{ $t('sys.dept.viewTree') }}</Radio>
      </RadioGroup>
      <!-- 组织架构图视图（仅查看），与列表共享同一份树数据，跟随本地搜索过滤 -->
      <div v-show="viewType === 'tree'" class="org-chart">
        <Vue3TreeOrg
          v-if="orgRoot"
          :data="orgRoot"
          center
          :collapsable="true"
          :expand-all="true"
          :default-expand-level="999"
          :horizontal="false"
          :props="{
            id: 'id',
            parentId: 'parentId',
            label: 'name',
            children: 'children',
          }"
        />
        <Empty v-else :description="$t('sys.dept.rootDept')" class="m-auto" />
      </div>
      <Grid v-show="viewType === 'table'" class="min-h-0 flex-1">
        <!-- 表格上方最左侧，部门名称本地搜索框 -->
        <template #toolbar-actions>
          <Input
            v-model:value="searchName"
            allow-clear
            :placeholder="$t('sys.dept.searchPlaceholder')"
            style="width: 220px"
            @change="onSearch"
          />
        </template>
        <template #toolbar-tools>
          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create') }}
          </Button>
        </template>
      </Grid>
    </div>
  </Page>
</template>

<style scoped>
/* 页面容器：切换按钮独占一行，视图区域撑满剩余高度 */
.dept-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 组织架构图容器与主题适配（亮/暗色），注意 vben 主题变量为 HSL 通道值，需 hsl() 包裹 */
.org-chart {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.org-chart :deep(.zm-tree-org) {
  height: 100%;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

.org-chart :deep(.zm-tree-org .zoom-container) {
  background-color: transparent;
}

/* 节点卡片：边框用前景色 25% 混合，亮/暗色下均清晰可见 */
.org-chart :deep(.tree-org-node__content) {
  padding: 6px 12px;
  background-color: hsl(var(--card));
  color: hsl(var(--foreground));
  border: 1px solid color-mix(in srgb, hsl(var(--foreground)) 25%, transparent);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 10%);
  cursor: default;
}

/* 去掉库默认 __inner 的投影（视觉上第二层边框），仅保留 __content 外边框 */
.org-chart :deep(.tree-org-node__inner) {
  box-shadow: none;
}

/* 展开/收缩按钮：主题色实心圆点，+/− 图标默认 #ccc 需一并覆盖为主题前景色 */
.org-chart :deep(.tree-org-node__expand) {
  width: 20px;
  height: 20px;
  background-color: hsl(var(--primary));
  border: 2px solid hsl(var(--background));
  color: hsl(var(--primary-foreground));
  box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
}

.org-chart :deep(.tree-org-node__expand:hover) {
  background-color: hsl(var(--primary) / 80%);
}

.org-chart
  :deep(.tree-org-node__expand .tree-org-node__expand-btn::before),
.org-chart
  :deep(.tree-org-node__expand .tree-org-node__expand-btn::after) {
  border-color: hsl(var(--primary-foreground));
}

/* 连接线：默认 #ddd 过浅，改为与节点边框同色系 */
.org-chart :deep(.tree-org-node::after),
.org-chart :deep(.tree-org-node:not(:first-child)::before),
.org-chart :deep(.tree-org-node:not(:last-child)::after),
.org-chart :deep(.tree-org-node__children::before),
.org-chart
  :deep(.collapsable .tree-org-node.collapsed .tree-org-node__content::after) {
  border-color: color-mix(in srgb, hsl(var(--foreground)) 30%, transparent);
}

/* 右下角缩放工具条主题适配 */
.org-chart :deep(.zm-tree-handle .zm-tree-handle-item) {
  color: hsl(var(--muted-foreground));
  background-color: hsl(var(--card));
  border-color: color-mix(in srgb, hsl(var(--foreground)) 25%, transparent);
}
</style>
