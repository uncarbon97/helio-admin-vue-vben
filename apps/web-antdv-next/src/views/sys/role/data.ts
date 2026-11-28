import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysRoleApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { EnabledStatusEnum } from '#/api/common';
import { $t } from '#/locales';
import type { PageAccess } from '#/hooks/use-page-access';

/* 权限码前缀，对齐后端 */
export const permPrefix = 'sys:role:';

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
 * @param access 按钮级权限包
 */
export function useColumns<T = SysRoleApi.SysRoleDTO>(
  onActionClick: OnActionClickFn<T>,
  access: PageAccess,
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
      // 无 update 权限时回退只读标签展示
      cellRender: access.showUpdate
        ? {
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
          }
        : {
            name: 'CellTag',
            options: [
              {
                color: 'success',
                label: $t('common.enabled'),
                value: EnabledStatusEnum.ENABLED,
              },
              {
                color: 'error',
                label: $t('common.disabled'),
                value: EnabledStatusEnum.DISABLED,
              },
            ],
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
      formatter: 'formatDateTime',
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
          ...(access.showUpdate ? ['edit'] : []),
          ...(access.has('bind-menu') ? [{ code: 'bindMenu', text: $t('sys.role.setPermissions') }] : []),
          ...(access.showDelete ? ['delete'] : []),
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
