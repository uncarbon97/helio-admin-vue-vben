import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysRoleApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { $t } from '#/locales';

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.role.roleName'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('sys.role.roleCode'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调
 */
export function useColumns<T = SysRoleApi.SysRoleDTO>(
  onActionClick: OnActionClickFn<T>,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnumValue) => Promise<void>,
): VxeTableGridColumns {
  return [
    {
      field: 'name',
      title: $t('sys.role.roleName'),
      width: 200,
    },
    {
      field: 'code',
      title: $t('sys.role.roleCode'),
      width: 200,
    },
    {
      field: 'description',
      minWidth: 200,
      title: $t('sys.role.description'),
    },
    {
      cellRender: {
        attrs: {
          checkedChildren: $t('common.enabled'),
          onSwitch: ({
            row,
            value,
          }: {
            row: T;
            value: EnabledStatusEnumValue;
          }) => onToggleStatus(row, value),
          unCheckedChildren: $t('common.disabled'),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      title: $t('sys.role.status'),
      width: 100,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'warning',
            label: $t('sys.role.flagBuiltin'),
            value: 'builtin',
          },
        ],
      },
      field: 'flags',
      title: $t('sys.role.flags'),
      width: 100,
    },
    {
      field: 'createdAt',
      title: $t('sys.role.createTime'),
      width: 200,
    },
    {
      // 操作列
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('sys.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit',
          { code: 'bindMenu', text: $t('sys.role.setPermissions') },
          'delete',
        ],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('sys.role.operation'),
      width: 180,
    },
  ];
}

/**
 * 新增/修改表单
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.role.roleName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('sys.role.roleCode'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('sys.role.description'),
    },
  ];
}
