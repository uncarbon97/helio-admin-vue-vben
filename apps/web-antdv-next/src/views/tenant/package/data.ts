import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { TenantPackageApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { EnabledStatusEnum } from '#/api/common';
import { $t } from '#/locales';
import type { PageAccess } from '#/hooks/use-page-access';

/* 权限码前缀，对齐后端 */
export const permPrefix = 'tenant:package:';

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('tenant.package.packageName'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('tenant.package.packageCode'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调（页面层做二次确认）
 * @param access 按钮级权限包
 */
export function useColumns<T = TenantPackageApi.TenantPackageDTO>(
  onActionClick: OnActionClickFn<T>,
  access: PageAccess,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnumValue) => Promise<void>,
): VxeTableGridColumns {
  return [
    {
      field: 'name',
      title: $t('tenant.package.packageName'),
      width: 200,
    },
    {
      field: 'code',
      title: $t('tenant.package.packageCode'),
      width: 200,
    },
    {
      field: 'description',
      minWidth: 200,
      title: $t('tenant.package.description'),
    },
    {
      // 无 update 权限时回退只读标签展示
      cellRender: access.showUpdate
        ? {
            attrs: {
              checkedChildren: $t('common.enabled'),
              onSwitch: ({ row, value }: { row: T; value: EnabledStatusEnumValue }) =>
                onToggleStatus(row, value),
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
      title: $t('tenant.package.status'),
      width: 100,
    },
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
      title: $t('tenant.package.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('tenant.package.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          ...(access.showUpdate ? ['edit'] : []),
          ...(access.showUpdate ? [{ code: 'bindMenu', text: $t('tenant.package.setPermissions') }] : []),
          ...(access.showDelete ? ['delete'] : []),
        ],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('tenant.package.operation'),
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
      label: $t('tenant.package.packageName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('tenant.package.packageCode'),
      rules: 'required',
    },
    // 状态不走表单，由列表行内开关切换（二次确认）；新增默认启用
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('tenant.package.description'),
    },
  ];
}
