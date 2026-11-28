import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SelectOptionItem, TenantMetaApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { EnabledStatusEnum } from '#/api/common';
import { $t } from '#/locales';
import type { PageAccess } from '#/hooks/use-page-access';

/* 权限码前缀，对齐后端 */
export const permPrefix = 'tenant:meta:';

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('tenant.meta.tenantName'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('tenant.meta.tenantCode'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick
 * @param packageNameMap 套餐ID👉名称映射（响应式，用于所属套餐列展示）
 * @param onToggleStatus 状态开关切换回调（页面层做二次确认）
 * @param access 按钮级权限包
 */
export function useColumns<T = TenantMetaApi.TenantMetaDTO>(
  onActionClick: OnActionClickFn<T>,
  access: PageAccess,
  packageNameMap: Ref<Map<string, string>>,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnumValue) => Promise<void>,
): VxeTableGridColumns {
  return [
    {
      field: 'name',
      title: $t('tenant.meta.tenantName'),
      width: 300,
    },
    {
      field: 'code',
      title: $t('tenant.meta.tenantCode'),
      width: 200,
    },
    {
      field: 'adminUserProfile',
      title: $t('tenant.meta.adminUser'),
      minWidth: 280,
      formatter: ({ row }) => {
        const profile = (row as TenantMetaApi.TenantMetaDTO).adminUserProfile;
        return profile?.nickname
          ? `${profile.nickname}(${profile.pin})`
          : (profile?.pin ?? '-');
      },
    },
    {
      field: 'packageId',
      title: $t('tenant.meta.packageName'),
      width: 160,
      formatter: ({ row }) => {
        const packageId = (row as TenantMetaApi.TenantMetaDTO).packageId;
        return packageNameMap.value.get(packageId) ?? '-';
      },
    },
    {
      //无 update 权限时回退只读标签展示
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
      title: $t('tenant.meta.status'),
      width: 100,
    },
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
      title: $t('tenant.meta.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('tenant.meta.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          ...(access.showUpdate ? ['edit'] : []),
          ...(access.showDelete ? ['delete'] : []),
        ],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('tenant.meta.operation'),
      width: 140,
    },
  ];
}

/**
 * 新增/修改表单
 * @param packageOptions 租户套餐下拉选项（响应式）
 */
export function useFormSchema(
  packageOptions: Ref<SelectOptionItem[]>,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 50 },
      fieldName: 'name',
      label: $t('tenant.meta.tenantName'),
      rules: 'required',
    },
    {
      // 仅新增可改编码
      component: 'Input',
      componentProps: { maxlength: 100 },
      description: $t('tenant.meta.tenantCodeTip'),
      fieldName: 'code',
      label: $t('tenant.meta.tenantCode'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: () => ({
        class: 'w-full',
        allowClear: true,
        options: packageOptions.value,
      }),
      fieldName: 'packageId',
      label: $t('tenant.meta.packageId'),
    },
    // ---- 租户管理员（仅新增） ----
    {
      component: 'Input',
      componentProps: { maxlength: 16 },
      description: $t('tenant.meta.adminSection'),
      fieldName: 'tenantAdminPin',
      label: $t('tenant.meta.adminPin'),
      rules: 'required',
    },
    {
      component: 'InputPassword',
      componentProps: { maxlength: 20 },
      fieldName: 'tenantAdminPwd',
      label: $t('tenant.meta.adminPwd'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 255 },
      fieldName: 'tenantAdminEmail',
      label: $t('tenant.meta.adminEmail'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 20 },
      fieldName: 'tenantAdminPhoneNo',
      label: $t('tenant.meta.adminPhoneNo'),
      rules: 'required',
    },
  ];
}
