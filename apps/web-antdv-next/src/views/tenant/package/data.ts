// adapt to helium: 租户套餐管理表格/查询条件配置
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { TenantPackageApi } from '#/api';

import { $t } from '#/locales';

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
 * @returns
 */
export function useColumns<T = TenantPackageApi.TenantPackageDTO>(
  onActionClick: OnActionClickFn<T>,
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
      // 后端无独立 set-status 接口，状态走新增/修改表单，此处仅展示
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: $t('common.enabled'), value: 1 },
          { color: 'error', label: $t('common.disabled'), value: 0 },
        ],
      },
      field: 'status',
      title: $t('tenant.package.status'),
      width: 100,
    },
    {
      field: 'createdAt',
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
          'edit',
          { code: 'bindMenu', text: $t('tenant.package.setPermissions') },
          'delete',
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
    {
      component: 'RadioGroup',
      defaultValue: 1,
      fieldName: 'status',
      label: $t('tenant.package.status'),
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('tenant.package.description'),
    },
  ];
}
