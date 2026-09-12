<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MenuApi, SysMenuApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { Button, Input, message } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  buildMenuTreeFull,
  deleteMenu,
  getMenuDetail,
  getMenuList,
  setMenuStatus,
} from '#/api';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

// 菜单名称本地搜索关键词 + 全量树缓存（纯前端过滤，不发请求）
const searchName = ref('');
// 树是否整体展开（默认折叠，由「展开/折叠」按钮控制）
const expanded = ref(false);
let cachedTree: SysMenuApi.MenuTreeNode[] = [];

/** 按名称过滤树：命中节点保留整棵子树，未命中但子孙命中的保留并继续下钻 */
function filterTree(
  nodes: SysMenuApi.MenuTreeNode[],
  keyword: string,
): SysMenuApi.MenuTreeNode[] {
  const result: SysMenuApi.MenuTreeNode[] = [];
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

/** 收集全部含子节点的树节点 id（搜索或「展开」时整体展开用） */
function collectAllParentIds(
  nodes: SysMenuApi.MenuTreeNode[],
): SysMenuApi.MenuTreeNode['id'][] {
  const result: SysMenuApi.MenuTreeNode['id'][] = [];
  nodes.forEach((node) => {
    if (node.children?.length) {
      result.push(node.id, ...collectAllParentIds(node.children));
    }
  });
  return result;
}

/** 根据当前关键词对树做本地过滤，返回要展示的记录 */
function applySearch(tree: SysMenuApi.MenuTreeNode[]) {
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
        // 菜单无分页：全量拉取后前端构建树，并缓存供本地搜索复用
        query: async () => {
          cachedTree = buildMenuTreeFull(await getMenuList());
          // 刷新后恢复展开状态：搜索命中或已点「展开」时全部展开，否则保持折叠
          gridApi.setGridOptions({
            treeConfig: {
              expandRowKeys:
                searchName.value.trim() || expanded.value
                  ? collectAllParentIds(cachedTree)
                  : [],
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
  } as VxeTableGridOptions<SysMenuApi.MenuTreeNode>,
});

function onActionClick(e: OnActionClickParams<MenuApi.SysMenuDTO>) {
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

async function onEdit(row: MenuApi.SysMenuDTO) {
  // 修改前拉取详情，保证数据为最新
  const detail = await getMenuDetail(row.id);
  formDrawerApi.setData(detail).open();
}

/**
 * 状态开关切换（成功后由 CellSwitch 渲染器行内更新，失败回弹）
 */
async function onToggleStatus(
  row: MenuApi.SysMenuDTO,
  newStatus: EnabledStatusEnum,
) {
  await setMenuStatus([row.id], newStatus);
  message.success($t('ui.actionMessage.operationSuccess'));
}

async function onDelete(row: MenuApi.SysMenuDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteMenu(row.id);
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

// 菜单名称本地搜索，纯前端过滤缓存数据，不发请求
async function onSearch() {
  if (cachedTree.length === 0) {
    return;
  }
  const keyword = searchName.value.trim();
  const grid = gridApi.grid;
  await grid.reloadData(applySearch(cachedTree));
  // reloadData 后 treeConfig.expandRowKeys 不会重新生效，需显式展开/折叠
  // 搜索时全部展开；清空搜索后跟随「展开/折叠」按钮状态
  await grid.setAllTreeExpand(Boolean(keyword) || expanded.value);
}

/** 「展开/折叠」按钮：整体展开或折叠全部树节点 */
async function onToggleExpand() {
  expanded.value = !expanded.value;
  await gridApi.grid?.setAllTreeExpand(expanded.value);
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <!-- 表格上方最左侧，菜单名称本地搜索框 -->
      <template #toolbar-actions>
        <Input
          v-model:value="searchName"
          allow-clear
          :placeholder="$t('sys.menu.searchPlaceholder')"
          style="width: 220px"
          @change="onSearch"
        />
      </template>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create') }}
        </Button>
        <!-- 展开/折叠整棵菜单树（默认折叠） -->
        <Button @click="onToggleExpand">
          {{ expanded ? $t('sys.menu.collapse') : $t('sys.menu.expand') }}
        </Button>
      </template>
      <!-- 图标列：动态渲染菜单配置的 iconify 图标名（flex 保证单元格内水平/垂直居中） -->
      <template #icon="{ row }">
        <div
          v-if="row.icon"
          class="flex size-full items-center justify-center"
        >
          <IconifyIcon :icon="row.icon" class="size-4" />
        </div>
      </template>
    </Grid>
  </Page>
</template>
