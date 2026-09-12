<script lang="ts" setup>
import type { SysRoleApi } from '#/api';
import type { MenuTreeNode } from '#/api/sys/menu';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Checkbox, Empty, Segmented, Spin, Tabs } from 'antdv-next';

import { buildMenuTree, getVisibleMenuList } from '#/api/sys/menu';
import { bindRoleMenu, getRoleDetail } from '#/api/sys/role';
import { MenuTypeEnum } from '#/api';
import { $t } from '#/locales';

interface PermItem {
  id: string;
  name: string;
}

/** 树表格行数据：BUTTON 子级内联到权限列，非 BUTTON 子级保持树结构 */
interface PermRow {
  children?: PermRow[];
  icon?: string;
  id: string;
  level: number;
  name: string;
  permissions: PermItem[];
}

const emits = defineEmits(['success']);

const TabPane = Tabs.TabPane;

const roleId = ref<string>();
const roleName = ref('');
const loading = ref(false);
const rows = ref<PermRow[]>([]);

/** 勾选集（含菜单与按钮的全部 id） */
const checkedIds = ref(new Set<string>());
/** 关联/独立勾选模式 */
const linkMode = ref<'independent' | 'linked'>('linked');
/** 展开的菜单节点 id */
const expandedIds = ref(new Set<string>());
const collapsed = ref(false);
const activeTab = ref('perm');

const [Drawer, drawerApi] = useVbenDrawer<null | SysRoleApi.SysRoleDTO>({
  async onConfirm() {
    if (!roleId.value) return;
    drawerApi.lock();
    try {
      await bindRoleMenu(roleId.value, [...checkedIds.value]);
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      roleId.value = data?.id;
      roleName.value = data?.name ?? '';
      await reload(data?.menuIds ?? []);
    }
  },
});

defineExpose({ drawerApi });

/** 重新拉取菜单树与角色详情（回显勾选） */
async function reload(menuIds?: string[]) {
  loading.value = true;
  try {
    const [menuList, detail] = await Promise.all([
      getVisibleMenuList(),
      menuIds || !roleId.value
        ? Promise.resolve(undefined)
        : getRoleDetail(roleId.value),
    ]);
    rows.value = toRows(buildMenuTree(menuList ?? []));
    checkedIds.value = new Set(menuIds ?? detail?.menuIds ?? []);
    resetExpanded();
  } finally {
    loading.value = false;
  }
}

/** 树节点 → 行数据 */
function toRows(nodes: MenuTreeNode[], level = 0): PermRow[] {
  return nodes.map((node) => {
    const buttonKids = (node.children ?? []).filter(
      (child) => child.menuType === MenuTypeEnum.BUTTON,
    );
    const menuKids = (node.children ?? []).filter(
      (child) => child.menuType !== MenuTypeEnum.BUTTON,
    );
    return {
      children: menuKids.length > 0 ? toRows(menuKids, level + 1) : undefined,
      icon: node.icon,
      id: node.id,
      level,
      name: node.name,
      permissions: buttonKids.map((child) => ({
        id: child.id,
        name: child.name,
      })),
    };
  });
}

/** 展开的行（由 expandedIds 派生） */
const visibleRows = computed(() => {
  const result: PermRow[] = [];
  const walk = (list: PermRow[]) => {
    list.forEach((row) => {
      result.push(row);
      if (row.children && expandedIds.value.has(row.id)) {
        walk(row.children);
      }
    });
  };
  walk(rows.value);
  return result;
});

const getTitle = computed(() => $t('sys.role.grantTitle', [roleName.value]));

/** 全选（表头）状态 */
const allChecked = computed(() => {
  const ids = allIds();
  return ids.length > 0 && ids.every((id) => checkedIds.value.has(id));
});
const allIndeterminate = computed(() => {
  if (allChecked.value) return false;
  return allIds().some((id) => checkedIds.value.has(id));
});

function allIds(): string[] {
  const result: string[] = [];
  const walk = (list: PermRow[]) => {
    list.forEach((row) => {
      result.push(row.id);
      row.permissions.forEach((perm) => result.push(perm.id));
      if (row.children) walk(row.children);
    });
  };
  walk(rows.value);
  return result;
}

/** 行及全部后代 id */
function collectIds(row: PermRow): string[] {
  const result = [row.id, ...row.permissions.map((perm) => perm.id)];
  row.children?.forEach((child) => result.push(...collectIds(child)));
  return result;
}

/** 行内任意后代（含自身按钮）是否有勾选 */
function hasDescendantChecked(row: PermRow): boolean {
  if (row.permissions.some((perm) => checkedIds.value.has(perm.id))) {
    return true;
  }
  return (row.children ?? []).some(
    (child) => checkedIds.value.has(child.id) || hasDescendantChecked(child),
  );
}

function isRowChecked(row: PermRow) {
  return checkedIds.value.has(row.id);
}

function isRowIndeterminate(row: PermRow) {
  // 独立模式下不做父子联动展示
  return linkMode.value === 'linked' && hasDescendantChecked(row);
}

function onToggleRow(row: PermRow, checked: boolean) {
  const ids = linkMode.value === 'linked' ? collectIds(row) : [row.id];
  ids.forEach((id) =>
    checked ? checkedIds.value.add(id) : checkedIds.value.delete(id),
  );
  if (linkMode.value === 'linked') {
    refreshAncestors();
  }
}

function onTogglePerm(perm: PermItem, checked: boolean) {
  if (checked) {
    checkedIds.value.add(perm.id);
  } else {
    checkedIds.value.delete(perm.id);
  }
  if (linkMode.value === 'linked') {
    refreshAncestors();
  }
}

function onToggleAll(checked: boolean) {
  if (checked) {
    allIds().forEach((id) => checkedIds.value.add(id));
  } else {
    checkedIds.value = new Set();
  }
}

/**
 * 关联模式下自底向上补全/清除父节点勾选：
 * 子级全选则父级入集，反之移除（保持半选由 indeterminate 展示）
 */
function refreshAncestors() {
  const fix = (row: PermRow): boolean => {
    const hasKids =
      row.permissions.length > 0 || (row.children?.length ?? 0) > 0;
    if (!hasKids) {
      return checkedIds.value.has(row.id);
    }
    let full = true;
    row.permissions.forEach((perm) => {
      full = full && checkedIds.value.has(perm.id);
    });
    (row.children ?? []).forEach((child) => {
      full = fix(child) && full;
    });
    if (full) {
      checkedIds.value.add(row.id);
    } else {
      checkedIds.value.delete(row.id);
    }
    return full;
  };
  rows.value.forEach(fix);
}

/** 默认展开到第 2 层 */
function resetExpanded() {
  const ids = new Set<string>();
  const walk = (list: PermRow[]) => {
    list.forEach((row) => {
      if (row.level < 2 && row.children) {
        ids.add(row.id);
        walk(row.children);
      }
    });
  };
  walk(rows.value);
  expandedIds.value = ids;
  collapsed.value = false;
}

function onToggleExpand() {
  if (collapsed.value) {
    resetExpanded();
  } else {
    expandedIds.value = new Set();
    collapsed.value = true;
  }
}

function onToggleNode(row: PermRow) {
  if (!row.children) return;
  if (expandedIds.value.has(row.id)) {
    expandedIds.value.delete(row.id);
  } else {
    expandedIds.value.add(row.id);
  }
}
</script>
<template>
  <Drawer
    :title="getTitle"
    class="w-[min(1200px,92vw)]"
    :confirm-text="$t('sys.role.savePermissions')"
  >
    <Spin :spinning="loading" :classes="{ root: 'w-full' }">
      <Tabs v-model:active-key="activeTab">
        <TabPane key="perm" :tab="$t('sys.role.tabFunctionPerm')" class="pt-2">
          <!-- 工具栏：关联/独立、折叠、刷新 -->
          <div class="mb-2 flex items-center justify-end gap-2">
            <Segmented
              v-model:value="linkMode"
              :options="[
                { label: $t('sys.role.nodeLinked'), value: 'linked' },
                {
                  label: $t('sys.role.nodeIndependent'),
                  value: 'independent',
                },
              ]"
              size="small"
            />
            <Button size="small" @click="onToggleExpand">
              <IconifyIcon
                class="mr-1 size-3.5"
                :icon="
                  collapsed
                    ? 'ant-design:expand-outlined'
                    : 'ant-design:menu-fold-outlined'
                "
              />
              {{ collapsed ? $t('sys.role.expand') : $t('sys.role.collapse') }}
            </Button>
            <Button size="small" @click="reload()">
              <IconifyIcon class="size-3.5" icon="ant-design:reload-outlined" />
            </Button>
          </div>

          <!-- 树表格 -->
          <div
            class="overflow-hidden rounded border border-gray-200 dark:border-gray-700"
          >
            <div
              class="grid grid-cols-[48px_minmax(160px,2fr)_minmax(0,3fr)] items-center bg-gray-50 px-2 py-2 font-medium dark:bg-gray-900"
            >
              <Checkbox
                :checked="allChecked"
                :indeterminate="allIndeterminate"
                @change="(e: any) => onToggleAll(e.target.checked)"
              />
              <span>{{ $t('sys.role.menuCol') }}</span>
              <span>{{ $t('sys.role.permCol') }}</span>
            </div>
            <div v-if="visibleRows.length === 0" class="py-8">
              <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </div>
            <template v-else>
              <div
                v-for="row in visibleRows"
                :key="row.id"
                class="grid grid-cols-[48px_minmax(160px,2fr)_minmax(0,3fr)] items-center border-t border-gray-100 px-2 py-1.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
              >
                <Checkbox
                  :checked="isRowChecked(row)"
                  :indeterminate="isRowIndeterminate(row)"
                  @change="(e: any) => onToggleRow(row, e.target.checked)"
                />
                <div
                  class="flex items-center gap-1 truncate"
                  :style="{ paddingLeft: `${row.level * 20}px` }"
                >
                  <IconifyIcon
                    v-if="row.children"
                    class="cursor-pointer text-gray-400 transition-transform"
                    :class="expandedIds.has(row.id) ? '' : '-rotate-90'"
                    icon="ant-design:down-outlined"
                    @click="onToggleNode(row)"
                  />
                  <IconifyIcon
                    v-if="row.icon"
                    class="size-4"
                    :icon="row.icon"
                  />
                  <span class="truncate">{{ row.name }}</span>
                </div>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Checkbox
                    v-for="perm in row.permissions"
                    :key="perm.id"
                    :checked="checkedIds.has(perm.id)"
                    @change="(e: any) => onTogglePerm(perm, e.target.checked)"
                  >
                    {{ perm.name }}
                  </Checkbox>
                </div>
              </div>
            </template>
          </div>
        </TabPane>
        <TabPane key="user" :tab="$t('sys.role.tabRoleUser')">
          <div class="flex items-center justify-center py-16">
            <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </div>
        </TabPane>
      </Tabs>
    </Spin>
  </Drawer>
</template>
