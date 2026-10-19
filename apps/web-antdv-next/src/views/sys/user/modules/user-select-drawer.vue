<script lang="ts" setup>
// helium customization: 选人抽屉 —— 复用用户管理的查询条件/部门树/列定义，勾选多选后回传；登录日志按用户多选查询使用
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SysUserApi } from '#/api';
import type { EntityPickerItem } from '#/components/entity-picker';

import { nextTick, ref, watch } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getUserList } from '#/api';
import {
  EntityPickerDrawer,
  useEntityPicker,
} from '#/components/entity-picker';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from '../data';
import DeptTreeCard from './dept-tree-card.vue';

defineOptions({ name: 'UserSelectDrawer' });

const props = defineProps<{
  /** 受控打开状态 */
  open?: boolean;
  /** 外部已选（打开时回显勾选） */
  selected?: EntityPickerItem[];
}>();

const emit = defineEmits<{
  (e: 'confirm', items: EntityPickerItem[]): void;
  (e: 'update:open', open: boolean): void;
}>();

const picker = useEntityPicker<SysUserApi.SysUserDTO>({
  label: (row) => `${row.nickname}(${row.pin})`,
});

const selectedDeptId = ref<null | string>(null);

const [Grid, gridApi] = useVbenVxeGrid({
  // vxe 事件须经 gridEvents 透传，写在 <Grid> 模板上不会触发
  gridEvents: {
    checkboxAll: onCheckboxAll,
    checkboxChange: onCheckboxChange,
    dataChange: onDataChange,
  },
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    checkboxConfig: {
      highlight: true,
    },
    // 选人场景增加复选框列；不传操作回调，操作列与状态开关按只读展示
    columns: [{ type: 'checkbox', width: 50 }, ...(useColumns() ?? [])],
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getUserList({
            pageParam: {
              pageNum: page.currentPage,
              pageSize: page.pageSize,
            },
            phoneNo: formValues.phoneNo,
            // 左侧部门树联动过滤
            selectedDeptId: selectedDeptId.value ?? undefined,
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
      search: true,
      zoom: false,
    },
  } as VxeTableGridOptions<SysUserApi.SysUserDTO>,
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // 打开时重置为外部已选，并清除表格残留勾选（外部清空后重开场景）
      picker.reset(props.selected ?? []);
      syncGridSelection();
    }
  },
);

function onDeptSelect(deptId: null | string) {
  selectedDeptId.value = deptId;
  gridApi.query();
}

/** 单行勾选/取消 */
function onCheckboxChange({
  checked,
  row,
}: {
  checked: boolean;
  row: SysUserApi.SysUserDTO;
}) {
  picker.toggleRow(row, checked);
}

/** 当前页全选/取消全选 */
function onCheckboxAll({ records }: { records: SysUserApi.SysUserDTO[] }) {
  const $grid = gridApi.grid;
  if (!$grid) return;
  const checkedSet = new Set(records);
  ($grid.getTableData().visibleData ?? []).forEach((row) => {
    picker.toggleRow(row, checkedSet.has(row));
  });
}

/** 按当前已选同步表格勾选：先清后设，保证取消/清空的行不再勾选 */
async function syncGridSelection() {
  await nextTick();
  const $grid = gridApi.grid;
  if (!$grid) return;
  await $grid.clearCheckboxRow();
  const ids = new Set(picker.items.value.map((item) => item.id));
  const rows = ($grid.getTableData().visibleData ?? []).filter((row) =>
    ids.has(row.id),
  );
  if (rows.length > 0) {
    await $grid.setCheckboxRow(rows, true);
  }
}

/** 数据刷新（翻页/查询）后回显已选行勾选状态 */
function onDataChange() {
  syncGridSelection();
}

function onConfirm() {
  emit('confirm', picker.getItems());
  emit('update:open', false);
}
</script>
<template>
  <EntityPickerDrawer
    :count="picker.items.value.length"
    :count-unit="$t('sys.user.countUnit')"
    :open="props.open"
    :title="$t('sys.user.selectTitle')"
    @confirm="onConfirm"
    @update:open="emit('update:open', $event)"
  >
    <div class="flex min-h-0 w-full flex-1 gap-2">
      <!-- 左侧部门树：宽度加在外层容器，避免与 Card 自身 w-full 类冲突 -->
      <div class="w-60 shrink-0">
        <DeptTreeCard @select="onDeptSelect" />
      </div>
      <!-- 右侧用户列表 -->
      <div class="min-w-0 flex-1">
        <Grid />
      </div>
    </div>
  </EntityPickerDrawer>
</template>
