import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { DeptOptionNode, SysUserApi, UiConfigApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';
import type { PageAccess } from '#/hooks/use-page-access';

import { EnabledStatusEnum, GenderEnum } from '#/api/common';
import { FULL_PAGE_ACCESS } from '#/hooks/use-page-access';
import { $t } from '#/locales';

/* 权限码前缀，对齐后端 */
export const permPrefix = 'sys:user:';

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('sys.user.phoneNoFull'),
      },
      fieldName: 'phoneNoFull',
      label: $t('sys.user.phoneNoFull'),
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 4,
        placeholder: $t('sys.user.phoneNoTail4'),
      },
      fieldName: 'phoneNoTail4',
      label: $t('sys.user.phoneNoTail4'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调
 * @param showUserFirstFeatures 用户优先模式开关（后端UI配置下发）
 * @param userDeleteAction 「删除」按钮语义（后端UI配置下发）
 * @param access 按钮级权限包（未传时视为全部放行，选人抽屉复用场景）
 */
export function useColumns<T = SysUserApi.SysUserDTO>(
  onActionClick?: OnActionClickFn<T>,
  access: PageAccess = FULL_PAGE_ACCESS,
  onToggleStatus?: (row: T, newStatus: EnabledStatusEnumValue) => Promise<void>,
  showUserFirstFeatures = false,
  userDeleteAction?: UiConfigApi.UserDeleteActionEnumValue,
): VxeTableGridColumns {
  // 租户域下「删除」降级为「移出本租户」，避免独立入口与之重复
  const deleteActionIsExpel = userDeleteAction === 'TENANT_EXPEL';
  // 「删除」按钮：租户域「删除」降级为「移出本租户」（保留危险色），平台域为「删除」
  let deleteChild: 'delete' | null | { code: string; danger: true; text: string } = null;
  if (deleteActionIsExpel) {
    if (access.has('join')) {
      deleteChild = { code: 'tenantExpel', danger: true, text: $t('sys.user.tenantExpel') };
    }
  } else if (access.showDelete) {
    deleteChild = 'delete';
  }
  // 「其他操作」收纳的低频操作（全被权限过滤后不渲染该下拉）
  const otherChildren = [
    ...(access.has('bind-dept') ? [{ code: 'bindDept', text: $t('sys.user.bindDept') }] : []),
    ...(access.has('reset-password') ? [{ code: 'resetPwd', text: $t('sys.user.resetPwd') }] : []),
    ...(access.has('kick-out') ? [{ code: 'kickOut', text: $t('sys.user.kickOut') }] : []),
    // 用户优先模式平台域：追加独立的「移出租户」入口
    ...(showUserFirstFeatures && !deleteActionIsExpel && access.has('join') ? [{ code: 'tenantExpel', text: $t('sys.user.tenantExpel') }] : []),
    deleteChild,
  ].filter((item) => item !== null);
  return [
    {
      field: 'pin',
      title: $t('sys.user.pin'),
      width: 140,
    },
    {
      field: 'nickname',
      minWidth: 140,
      title: $t('sys.user.nickname'),
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            label: $t('sys.user.genderUnknown'),
            value: GenderEnum.UNKNOWN,
          },
          {
            color: 'blue',
            label: $t('sys.user.genderMale'),
            value: GenderEnum.MALE,
          },
          {
            color: 'magenta',
            label: $t('sys.user.genderFemale'),
            value: GenderEnum.FEMALE,
          },
        ],
      },
      field: 'gender',
      title: $t('sys.user.gender'),
      width: 90,
    },
    {
      field: 'deptName',
      minWidth: 140,
      title: $t('sys.user.deptName'),
    },
    {
      field: 'phoneNoMasked',
      title: $t('sys.user.phoneNo'),
      width: 140,
    },
    {
      field: 'emailMasked',
      minWidth: 180,
      title: $t('sys.user.email'),
    },
    {
      // 无 update 权限 / 选人复用无回调时，回退只读标签
      cellRender:
        onToggleStatus && access.showUpdate
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
      title: $t('sys.user.status'),
      width: 100,
    },
    {
      field: 'lastLoginAt',
      formatter: 'formatDateTime',
      title: $t('sys.user.lastLoginAt'),
      width: 180,
    },
    // 未传操作回调时不生成操作列（选人抽屉复用列定义）
    ...(onActionClick
      ? [
          {
            align: 'center' as const,
            cellRender: {
              attrs: {
                nameField: 'nickname',
                nameTitle: $t('sys.user.nickname'),
                onClick: onActionClick,
              },
              name: 'CellOperation',
              options: [
                'detail',
                ...(access.showUpdate ? ['edit'] : []),
                ...(access.has('bind-role') ? [{ code: 'bindRole', text: $t('sys.user.bindRole') }] : []),
                // 收纳低频操作（见上方 otherChildren，空则不渲染）
                ...(otherChildren.length > 0
                  ? [{ children: otherChildren, text: $t('sys.user.otherActions') }]
                  : []),
              ],
            },
            field: 'operation',
            fixed: 'right' as const,
            // 关闭溢出 tooltip
            showOverflow: false,
            title: $t('sys.user.operation'),
            width: 270,
          },
        ]
      : []),
  ];
}

/**
 * 新增/修改表单
 * @param deptOptions 部门树选项
 */
export function useFormSchema(
  deptOptions: Ref<DeptOptionNode[]>,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        maxlength: 16,
      },
      fieldName: 'pin',
      label: $t('sys.user.pin'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 20,
      },
      fieldName: 'nickname',
      label: $t('sys.user.nickname'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        class: 'w-auto',
        options: [
          { label: $t('sys.user.genderUnknown'), value: GenderEnum.UNKNOWN },
          { label: $t('sys.user.genderMale'), value: GenderEnum.MALE },
          { label: $t('sys.user.genderFemale'), value: GenderEnum.FEMALE },
        ],
      },
      defaultValue: GenderEnum.UNKNOWN,
      fieldName: 'gender',
      label: $t('sys.user.gender'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('sys.user.email'),
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 20,
      },
      fieldName: 'phoneNo',
      label: $t('sys.user.phoneNo'),
    },
    {
      component: 'TreeSelect',
      componentProps: () => ({
        allowClear: true,
        class: 'w-full',
        fieldNames: { children: 'children', label: 'name', value: 'id' },
        treeData: deptOptions.value,
        treeDefaultExpandAll: true,
      }),
      fieldName: 'deptId',
      label: $t('sys.user.deptName'),
    },
    {
      component: 'InputPassword',
      componentProps: {
        maxlength: 20,
      },
      description: $t('sys.user.initPwdTip'),
      fieldName: 'initPwd',
      hide: true,
      label: $t('sys.user.initPwd'),
      rules: 'required',
    },
  ];
}
