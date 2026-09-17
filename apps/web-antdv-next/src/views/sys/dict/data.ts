import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysDictApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { $t } from '#/locales';

/**
 * 左表-自定义分类列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调
 */
export function useCategoryColumns<T = SysDictApi.CategoryDTO>(
  onActionClick: OnActionClickFn<T>,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnum) => Promise<void>,
): VxeTableGridColumns {
  return [
    {
      field: 'name',
      minWidth: 120,
      title: $t('sys.dict.categoryName'),
    },
    {
      field: 'code',
      minWidth: 110,
      title: $t('sys.dict.categoryCode'),
    },
    {
      cellRender: {
        attrs: {
          checkedChildren: $t('common.enabled'),
          onSwitch: ({ row, value }: { row: T; value: EnabledStatusEnum }) =>
            onToggleStatus(row, value),
          unCheckedChildren: $t('common.disabled'),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      title: $t('sys.dict.status'),
      width: 90,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('sys.dict.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('sys.dict.operation'),
      width: 110,
    },
  ];
}

/**
 * 左表-内置字典列（只读）
 */
export function useBuiltinColumns(): VxeTableGridColumns {
  return [
    {
      field: 'name',
      minWidth: 120,
      title: $t('sys.dict.categoryName'),
    },
    {
      field: 'code',
      minWidth: 110,
      title: $t('sys.dict.categoryCode'),
    },
    {
      field: 'description',
      minWidth: 100,
      title: $t('sys.dict.description'),
    },
  ];
}

/**
 * 右表-字典项列
 * @param readonly 内置字典项只读：状态用标签展示、无操作列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调
 */
export function useItemColumns<T = SysDictApi.ItemDTO>(
  readonly: boolean,
  onActionClick: OnActionClickFn<T>,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnum) => Promise<void>,
): VxeTableGridColumns {
  const columns: VxeTableGridColumns = [
    {
      field: 'code',
      width: 140,
      title: $t('sys.dict.itemCode'),
    },
    {
      field: 'value',
      minWidth: 160,
      title: $t('sys.dict.itemValue'),
    },
    {
      field: 'label',
      minWidth: 140,
      title: $t('sys.dict.itemLabel'),
    },
    {
      field: 'sort',
      title: $t('sys.dict.sort'),
      width: 80,
    },
    {
      cellRender: readonly
        ? // 只读模式下用默认状态标签（1→启用/success，0→禁用/error）
          { name: 'CellTag' }
        : {
            attrs: {
              checkedChildren: $t('common.enabled'),
              onSwitch: ({
                row,
                value,
              }: {
                row: T;
                value: EnabledStatusEnum;
              }) => onToggleStatus(row, value),
              unCheckedChildren: $t('common.disabled'),
            },
            name: 'CellSwitch',
          },
      field: 'status',
      title: $t('sys.dict.status'),
      width: 90,
    },
    {
      field: 'description',
      minWidth: 160,
      title: $t('sys.dict.description'),
    },
  ];

  if (!readonly) {
    columns.push(
      {
        field: 'createdAt',
        title: $t('sys.dict.createTime'),
        width: 180,
      },
      {
        align: 'center',
        cellRender: {
          attrs: {
            nameField: 'label',
            nameTitle: $t('sys.dict.itemLabel'),
            onClick: onActionClick,
          },
          name: 'CellOperation',
          options: ['edit', 'delete'],
        },
        field: 'operation',
        fixed: 'right',
        // 关闭溢出 tooltip
        showOverflow: false,
        title: $t('sys.dict.operation'),
        width: 130,
      },
    );
  }

  return columns;
}

/**
 * 字典分类新增/修改表单
 */
export function useCategoryFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 100 },
      fieldName: 'code',
      label: $t('sys.dict.categoryCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 100 },
      fieldName: 'name',
      label: $t('sys.dict.categoryName'),
      rules: 'required',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: $t('common.enabled'),
        checkedValue: 1,
        class: 'w-auto',
        unCheckedChildren: $t('common.disabled'),
        unCheckedValue: 0,
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('sys.dict.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 255 },
      fieldName: 'description',
      label: $t('sys.dict.description'),
    },
  ];
}

/**
 * 字典项新增/修改表单
 */
export function useItemFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 100 },
      fieldName: 'code',
      label: $t('sys.dict.itemCode'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 10_000 },
      fieldName: 'value',
      label: $t('sys.dict.itemValue'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 100 },
      fieldName: 'label',
      label: $t('sys.dict.itemLabel'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 0,
      fieldName: 'sort',
      label: $t('sys.dict.sort'),
      rules: 'required',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: $t('common.enabled'),
        checkedValue: 1,
        class: 'w-auto',
        unCheckedChildren: $t('common.disabled'),
        unCheckedValue: 0,
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('sys.dict.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 255 },
      fieldName: 'description',
      label: $t('sys.dict.description'),
    },
  ];
}
