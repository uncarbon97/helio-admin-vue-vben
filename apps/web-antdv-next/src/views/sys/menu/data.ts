import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { MenuApi } from '#/api';
import type { EnabledStatusEnum } from '#/api/common';

import { listIcons } from '@vben/icons';

import { MenuTypeEnum } from '#/api';
import { $t } from '#/locales';

/** 上级菜单树选项节点（含虚拟根菜单 id=0） */
export interface ParentTreeOption {
  children?: ParentTreeOption[];
  id: string;
  name: string;
}

/** 菜单类型 → 标签/颜色映射（后端枚举按整数序列化） */
const MENU_TYPE_TAG_OPTIONS = [
  { color: 'processing', label: $t('sys.menu.typeDir'), value: MenuTypeEnum.DIR },
  { color: 'success', label: $t('sys.menu.typeMenu'), value: MenuTypeEnum.MENU },
  { color: 'warning', label: $t('sys.menu.typeButton'), value: MenuTypeEnum.BUTTON },
  {
    color: 'error',
    label: $t('sys.menu.typeExternalLink'),
    value: MenuTypeEnum.EXTERNAL_LINK,
  },
];

/** 菜单类型单选项 */
const MENU_TYPE_RADIO_OPTIONS = MENU_TYPE_TAG_OPTIONS.map(
  ({ label, value }) => ({ label, value }),
);

/**
 * 表格列
 * @param onActionClick
 * @param onToggleStatus 状态开关切换回调
 */
export function useColumns<T = MenuApi.SysMenuDTO>(
  onActionClick: OnActionClickFn<T>,
  onToggleStatus: (row: T, newStatus: EnabledStatusEnum) => Promise<void>,
): VxeTableGridColumns {
  return [
    {
      align: 'left',
      field: 'name',
      minWidth: 240,
      title: $t('sys.menu.menuName'),
      treeNode: true,
    },
    {
      align: 'center',
      field: 'icon',
      slots: { default: 'icon' },
      title: $t('sys.menu.icon'),
      width: 80,
    },
    {
      align: 'center',
      cellRender: {
        name: 'CellTag',
        options: MENU_TYPE_TAG_OPTIONS,
      },
      field: 'menuType',
      title: $t('sys.menu.menuType'),
      width: 90,
    },
    {
      field: 'permission',
      minWidth: 160,
      title: $t('sys.menu.permission'),
    },
    {
      // 外链类型显示外链地址，其余显示前端组件名称
      field: 'component',
      formatter: ({ row }) =>
        row.menuType === MenuTypeEnum.EXTERNAL_LINK
          ? (row.externalLink ?? '')
          : (row.component ?? ''),
      minWidth: 180,
      title: $t('sys.menu.component'),
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
      title: $t('sys.menu.status'),
      width: 100,
    },
    {
      field: 'sort',
      title: $t('sys.menu.sort'),
      width: 80,
    },
    {
      field: 'createdAt',
      title: $t('sys.menu.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('sys.menu.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit',
          'delete',
          { code: 'createChild', text: $t('sys.menu.createChild') },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('sys.menu.operation'),
      width: 200,
    },
  ];
}

/**
 * 新增/修改表单
 * @param parentOptions 上级菜单树选项（响应式，含虚拟根菜单）
 */
export function useFormSchema(
  parentOptions: Ref<ParentTreeOption[]>,
): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      componentProps: {
        options: MENU_TYPE_RADIO_OPTIONS,
      },
      defaultValue: MenuTypeEnum.MENU,
      fieldName: 'menuType',
      label: $t('sys.menu.menuType'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.menu.menuName'),
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
      label: $t('sys.menu.parentId'),
    },
    {
      // 目录/菜单/外链可选图标，按钮无意义；离线模式：图标列表来自本地注册的 ant-design 图标集
      component: 'IconPicker',
      componentProps: {
        autoFetchApi: false,
        icons: listIcons('', 'ant-design'),
        prefix: 'ant-design',
      },
      dependencies: {
        if: (values) => values.menuType !== MenuTypeEnum.BUTTON,
        triggerFields: ['menuType'],
      },
      fieldName: 'icon',
      label: $t('sys.menu.icon'),
    },
    {
      component: 'Input',
      componentProps: { placeholder: 'sys/menu/index' },
      dependencies: {
        if: (values) => values.menuType === MenuTypeEnum.MENU,
        triggerFields: ['menuType'],
      },
      description: $t('sys.menu.componentTip'),
      fieldName: 'component',
      label: $t('sys.menu.component'),
    },
    {
      component: 'Input',
      componentProps: { placeholder: 'https://example.com' },
      dependencies: {
        if: (values) => values.menuType === MenuTypeEnum.EXTERNAL_LINK,
        triggerFields: ['menuType'],
      },
      fieldName: 'externalLink',
      label: $t('sys.menu.externalLink'),
    },
    {
      component: 'Input',
      componentProps: { placeholder: 'sys:menu:list' },
      dependencies: {
        if: (values) =>
          values.menuType === MenuTypeEnum.BUTTON ||
          values.menuType === MenuTypeEnum.MENU,
        triggerFields: ['menuType'],
      },
      description: $t('sys.menu.permissionTip'),
      fieldName: 'permission',
      label: $t('sys.menu.permission'),
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 0,
      description: $t('sys.menu.sortTip'),
      fieldName: 'sort',
      label: $t('sys.menu.sort'),
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
      label: $t('sys.menu.status'),
    },
  ];
}
