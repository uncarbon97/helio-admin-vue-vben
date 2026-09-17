import type { Ref } from 'vue';

import type { ParentTreeOption } from '../dept/data';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysUserApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { GenderEnum, YesOrNoEnum } from '#/api/common';
import { $t } from '#/locales';

/**
 * 上方查询条件（swagger 仅支持手机号关键词，部门由左侧树联动）
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('sys.user.phoneNo'),
      },
      fieldName: 'phoneNo',
      label: $t('sys.user.phoneNo'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调
 */
export function useColumns<T = SysUserApi.SysUserDTO>(
  onActionClick: OnActionClickFn<T>,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnumValue) => Promise<void>,
): VxeTableGridColumns {
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
      field: 'phoneNo',
      title: $t('sys.user.phoneNo'),
      width: 140,
    },
    {
      field: 'email',
      minWidth: 180,
      title: $t('sys.user.email'),
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
      title: $t('sys.user.status'),
      width: 100,
    },
    {
      field: 'lastLoginAt',
      title: $t('sys.user.lastLoginAt'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'nickname',
          nameTitle: $t('sys.user.nickname'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'detail',
          'edit',
          { code: 'bindRole', text: $t('sys.user.bindRole') },
          // 收纳低频操作
          {
            children: [
              { code: 'bindDept', text: $t('sys.user.bindDept') },
              { code: 'resetPwd', text: $t('sys.user.resetPwd') },
              { code: 'kickOut', text: $t('sys.user.kickOut') },
              'delete',
            ],
            text: $t('sys.user.otherActions'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('sys.user.operation'),
      width: 270,
    },
  ];
}

/**
 * 新增/修改表单
 * @param deptOptions 部门树选项（响应式）
 */
export function useFormSchema(
  deptOptions: Ref<ParentTreeOption[]>,
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
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'phoneNo',
      label: $t('sys.user.phoneNo'),
      rules: 'required',
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
    {
      component: 'RadioGroup',
      componentProps: {
        class: 'w-auto',
        options: [
          { label: $t('common.no'), value: YesOrNoEnum.NO },
          { label: $t('common.yes'), value: YesOrNoEnum.YES },
        ],
      },
      defaultValue: YesOrNoEnum.NO,
      fieldName: 'mustChangePassword',
      label: $t('sys.user.mustChangePassword'),
    },
  ];
}
