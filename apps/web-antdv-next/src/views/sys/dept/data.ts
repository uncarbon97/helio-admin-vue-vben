import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysDeptApi } from '#/api';
import type { EnabledStatusEnumValue } from '#/api/common';

import { EnabledStatusEnum } from '#/api/common';
import { $t } from '#/locales';
import type { PageAccess } from '#/hooks/use-page-access';

/** 上级部门树选项节点（含虚拟根部门 id=0） */
export interface ParentTreeOption {
  children?: ParentTreeOption[];
  id: string;
  name: string;
}

/* 权限码前缀，对齐后端 */
export const permPrefix = 'sys:dept:';


/**
 * 表格列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调
 * @param access 按钮级权限包
 */
export function useColumns<T = SysDeptApi.SysDeptDTO>(
  onActionClick: OnActionClickFn<T>,
  access: PageAccess,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnumValue) => Promise<void>,
): VxeTableGridColumns {
  return [
    {
      align: 'left',
      field: 'name',
      minWidth: 260,
      title: $t('sys.dept.deptName'),
      treeNode: true,
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
      title: $t('sys.dept.status'),
      width: 100,
    },
    {
      field: 'sort',
      title: $t('sys.dept.sort'),
      width: 100,
    },
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
      title: $t('sys.dept.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('sys.dept.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          ...(access.showUpdate ? ['edit'] : []),
          ...(access.showCreate ? [{ code: 'createChild', text: $t('sys.dept.createChild') }] : []),
          ...(access.showDelete ? ['delete'] : []),
        ],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('sys.dept.operation'),
      width: 200,
    },
  ];
}

/**
 * 新增/修改表单
 * @param parentOptions 上级部门树选项（响应式，含虚拟根部门）
 */
export function useFormSchema(
  parentOptions: Ref<ParentTreeOption[]>,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.dept.deptName'),
      rules: 'required',
    },
    {
      component: 'TreeSelect',
      componentProps: () => ({
        class: 'w-full',
        fieldNames: { children: 'children', label: 'name', value: 'id' },
        treeData: parentOptions.value,
        treeDefaultExpandAll: true,
      }),
      defaultValue: '0',
      fieldName: 'parentId',
      label: $t('sys.dept.parentId'),
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 0,
      description: $t('sys.dept.sortTip'),
      fieldName: 'sort',
      label: $t('sys.dept.sort'),
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: $t('common.enabled'),
        checkedValue: EnabledStatusEnum.ENABLED,
        class: 'w-auto',
        unCheckedChildren: $t('common.disabled'),
        unCheckedValue: EnabledStatusEnum.DISABLED,
      },
      defaultValue: EnabledStatusEnum.ENABLED,
      fieldName: 'status',
      label: $t('sys.dept.status'),
    },
  ];
}
