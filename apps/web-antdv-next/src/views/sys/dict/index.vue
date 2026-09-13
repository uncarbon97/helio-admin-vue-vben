<script lang="ts" setup>
// adapt to helium: 数据字典管理（左字典分类/内置字典 + 右字典项，左右联动）
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SysDictApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Input, message, Tabs } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictCategory,
  deleteDictItem,
  getDictBuiltinList,
  getDictCategoryList,
  getDictItemList,
  setDictCategoryStatus,
  setDictItemStatus,
} from '#/api';
import { $t } from '#/locales';

import {
  useBuiltinColumns,
  useCategoryColumns,
  useItemColumns,
} from './data';
import CategoryForm from './modules/category-form.vue';
import ItemForm from './modules/item-form.vue';

const TabPane = Tabs.TabPane;

/** 当前选中的字典分类（自定义可编辑 / 内置只读） */
type SelectedCategory =
  | { kind: 'builtin'; row: SysDictApi.BuiltinDTO }
  | { kind: 'custom'; row: SysDictApi.CategoryDTO };

const activeTab = ref<'builtin' | 'custom'>('custom');
const selectedCategory = ref<null | SelectedCategory>(null);
const categoryKeyword = ref('');

const [CategoryFormDrawer, categoryFormDrawerApi] = useVbenDrawer({
  connectedComponent: CategoryForm,
  destroyOnClose: true,
  closeOnClickModal: false,
});

const [ItemFormDrawer, itemFormDrawerApi] = useVbenDrawer({
  connectedComponent: ItemForm,
  destroyOnClose: true,
  closeOnClickModal: false,
});

/**
 * 左表：单个表格在「自定义分类 / 内置字典」间复用
 * （两个 TabPane 各挂表格会因隐藏容器导致列宽测量错误）
 */
const [CategoryGrid, categoryGridApi] = useVbenVxeGrid({
  gridEvents: {
    cellClick: ({ row }: { row: SysDictApi.BuiltinDTO | SysDictApi.CategoryDTO }) =>
      onCategoryClick(row),
  },
  gridOptions: {
    columns: useCategoryColumns(onCategoryActionClick, onToggleCategoryStatus),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const pageParam = {
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          };
          const name = categoryKeyword.value.trim() || undefined;
          // 同一左表复用：自定义分类 / 内置字典 两个端点
          return activeTab.value === 'custom'
            ? await getDictCategoryList({ name, pageParam })
            : await getDictBuiltinList({ name, pageParam });
        },
      },
    },
    rowConfig: {
      isCurrent: true,
      // 内置字典无 id，两类行都以 code 作行键
      keyField: 'code',
    },
    toolbarConfig: {
      custom: false,
      export: false,
      refresh: { code: 'query' },
      search: false,
      zoom: false,
    },
  } as VxeTableGridOptions<SysDictApi.BuiltinDTO | SysDictApi.CategoryDTO>,
});

/** 右表：字典项（内置分类时为本地内嵌数据，不分页） */
const [ItemGrid, itemGridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useItemColumns(true, onItemActionClick, onToggleItemStatus),
    height: 'auto',
    keepSource: true,
    // 未选分类/内置字典不分页，选中自定义分类后再启用（applyItemGridMode）
    pagerConfig: { enabled: false, pageSize: 20 },
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const selected = selectedCategory.value;
          if (!selected) {
            return { current: 1, records: [], size: page.pageSize, total: 0 };
          }
          if (selected.kind === 'builtin') {
            // adapt to helium: 内置字典项内嵌于 DTO，无独立 list 接口，本地返回不分页
            const records = selected.row.items ?? [];
            return {
              current: 1,
              records,
              size: records.length,
              total: records.length,
            };
          }
          return await getDictItemList({
            categoryId: selected.row.id,
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      // 刷新保持当前页码
      refresh: { code: 'query' },
      search: false,
      zoom: true,
    },
  } as VxeTableGridOptions<SysDictApi.ItemDTO>,
});

/** 右表标题：所选分类「名称 (编码)」 */
const itemGridTitle = computed(() => {
  const selected = selectedCategory.value;
  return selected
    ? `${selected.row.name} (${selected.row.code})`
    : $t('sys.dict.itemTitle');
});

/** 按当前 Tab 与选中分类，切换右表列/分页并重置到第一页 */
function applyItemGridMode() {
  const isCustom = selectedCategory.value?.kind === 'custom';
  itemGridApi.setGridOptions({
    columns: useItemColumns(!isCustom, onItemActionClick, onToggleItemStatus),
    pagerConfig: { enabled: isCustom, pageSize: 20 },
  });
  // adapt to helium: 切换分类重置到第一页（query 会保留旧页码，跨分类无意义）
  itemGridApi.reload();
}

function onTabChange() {
  selectedCategory.value = null;
  categoryGridApi.setGridOptions({
    columns:
      activeTab.value === 'custom'
        ? useCategoryColumns(onCategoryActionClick, onToggleCategoryStatus)
        : useBuiltinColumns(),
  });
  applyItemGridMode();
  // 重置左表到第一页并请求另一端点
  categoryGridApi.reload();
}

function onCategoryClick(
  row: SysDictApi.BuiltinDTO | SysDictApi.CategoryDTO,
) {
  selectedCategory.value =
    activeTab.value === 'custom'
      ? { kind: 'custom', row: row as SysDictApi.CategoryDTO }
      : { kind: 'builtin', row: row as SysDictApi.BuiltinDTO };
  applyItemGridMode();
}

function onCategoryActionClick(
  e: OnActionClickParams<SysDictApi.CategoryDTO>,
) {
  switch (e.code) {
    case 'delete': {
      onDeleteCategory(e.row);
      break;
    }
    case 'edit': {
      onEditCategory(e.row);
      break;
    }
  }
}

// adapt to helium: 后端无 detail 接口，直接用行数据编辑
function onEditCategory(row: SysDictApi.CategoryDTO) {
  categoryFormDrawerApi.setData(row).open();
}

function onCreateCategory() {
  categoryFormDrawerApi.setData(null).open();
}

/** 分类保存成功：刷新左表，并原地同步选中行（保持右表标题新鲜） */
function onCategorySaved(request: SysDictApi.CategoryUpsertRequest) {
  categoryGridApi.query();
  const selected = selectedCategory.value;
  if (selected?.kind === 'custom' && request.id === selected.row.id) {
    Object.assign(selected.row, request);
    itemGridApi.query();
  }
}

/**
 * 分类状态开关切换（成功后由 CellSwitch 渲染器行内更新，失败回弹）
 */
async function onToggleCategoryStatus(
  row: SysDictApi.CategoryDTO,
  newStatus: EnabledStatusEnum,
) {
  await setDictCategoryStatus(row.id, newStatus);
  message.success($t('ui.actionMessage.operationSuccess'));
}

async function onDeleteCategory(row: SysDictApi.CategoryDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteDictCategory(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.name]),
      key: 'action_process_msg',
    });
    // 删除的是当前选中分类时，清空右表
    if (
      selectedCategory.value?.kind === 'custom' &&
      selectedCategory.value.row.id === row.id
    ) {
      selectedCategory.value = null;
      applyItemGridMode();
    }
    categoryGridApi.query();
  } catch {
    hideLoading();
  }
}

function onItemActionClick(e: OnActionClickParams<SysDictApi.ItemDTO>) {
  switch (e.code) {
    case 'delete': {
      onDeleteItem(e.row);
      break;
    }
    case 'edit': {
      onEditItem(e.row);
      break;
    }
  }
}

// 后端无 detail 接口，直接用行数据编辑
function onEditItem(row: SysDictApi.ItemDTO) {
  const selected = selectedCategory.value;
  if (selected?.kind !== 'custom') return;
  itemFormDrawerApi
    .setData({
      category: { id: selected.row.id, name: selected.row.name },
      row,
    })
    .open();
}

function onCreateItem() {
  const selected = selectedCategory.value;
  if (selected?.kind !== 'custom') return;
  itemFormDrawerApi
    .setData({
      category: { id: selected.row.id, name: selected.row.name },
    })
    .open();
}

/**
 * 字典项状态开关切换（成功后由 CellSwitch 渲染器行内更新，失败回弹）
 */
async function onToggleItemStatus(
  row: SysDictApi.ItemDTO,
  newStatus: EnabledStatusEnum,
) {
  await setDictItemStatus(row.id, newStatus);
  message.success($t('ui.actionMessage.operationSuccess'));
}

async function onDeleteItem(row: SysDictApi.ItemDTO) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.label]),
    duration: 0,
    key: 'action_process_msg',
  });
  try {
    await deleteDictItem(row.id);
    message.success({
      content: $t('ui.actionMessage.deleteSuccess', [row.label]),
      key: 'action_process_msg',
    });
    itemGridApi.query();
  } catch {
    hideLoading();
  }
}

/** 左侧名称搜索（回车触发，自定义/内置两个端点均支持） */
function onCategorySearch() {
  categoryGridApi.reload();
}
</script>
<template>
  <Page auto-content-height>
    <CategoryFormDrawer @success="onCategorySaved" />
    <ItemFormDrawer @success="itemGridApi.query()" />
    <div class="flex h-full w-full gap-2">
      <!-- 左侧：字典分类 -->
      <Card
        class="w-144 shrink-0"
        :body-style="{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }"
      >
        <Tabs
          v-model:active-key="activeTab"
          class="mb-1 shrink-0"
          @change="onTabChange"
        >
          <TabPane key="custom" :tab="$t('sys.dict.customTab')" />
          <TabPane key="builtin" :tab="$t('sys.dict.builtinTab')" />
        </Tabs>
        <div class="mb-2 flex shrink-0 gap-1">
          <Button
            v-if="activeTab === 'custom'"
            size="small"
            type="primary"
            @click="onCreateCategory"
          >
            <Plus class="size-4" />
            {{ $t('ui.actionTitle.create') }}
          </Button>
          <Input
            v-model:value="categoryKeyword"
            allow-clear
            :placeholder="$t('sys.dict.searchPlaceholder')"
            size="small"
            @press-enter="onCategorySearch"
          />
        </div>
        <div class="min-h-0 flex-1">
          <CategoryGrid />
        </div>
      </Card>
      <!-- 右侧：字典项 -->
      <div class="min-w-0 flex-1">
        <ItemGrid :table-title="itemGridTitle">
          <template #toolbar-tools>
            <Button
              v-if="selectedCategory?.kind === 'custom'"
              type="primary"
              @click="onCreateItem"
            >
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create') }}
            </Button>
          </template>
        </ItemGrid>
      </div>
    </div>
  </Page>
</template>
