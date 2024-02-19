import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import Icon from '@/components/Icon/Icon.vue';
import { DescItem } from '@/components/Description';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '菜单名称',
    dataIndex: 'title',
    width: 120,
    align: 'left',
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 80,
    customRender: ({ record }) => {
      return h(Icon, { icon: record.icon });
    },
  },
  {
    title: '权限标识',
    dataIndex: 'permission',
    width: 100,
  },
  {
    title: '组件/外链',
    dataIndex: 'component',
    width: 240,
    customRender: ({ record }) => {
      const value = record.component;
      return 'LAYOUT' == value ? '' : value;
    },
  },
  {
    title: '菜单类型',
    dataIndex: 'type',
    width: 50,
    customRender: ({ record }) => {
      const value = record.type;
      let color, text;

      switch (value) {
        case 0:
          color = 'green';
          text = '目录';
          break;
        case 1:
          color = 'blue';
          text = '菜单';
          break;
        case 2:
          color = 'cyan';
          text = '按钮';
          break;
        case 3:
          color = 'red';
          text = '外链';
          break;
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    customRender: ({ record }) => {
      const value = record.status;
      let color, text;

      switch (value) {
        case 0:
          color = 'red';
          text = '禁用';
          break;
        case 1:
          color = 'green';
          text = '启用';
          break;
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 50,
  },
  {
    title: '上级节点ID(根节点设置为0)',
    dataIndex: 'parentId',
    width: 0,
  },
];

/**
 * 查询条件
 */
export const queryFormSchema: FormSchema[] = [];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'title',
    label: '菜单名称',
  },
  {
    field: 'typeLabel',
    label: '菜单类型',
  },
  {
    field: 'permission',
    label: '权限标识',
  },
  {
    field: 'icon',
    label: '图标',
  },
  {
    field: 'sort',
    label: '排序',
  },
  {
    field: 'statusLabel',
    label: '状态',
  },
  {
    field: 'component',
    label: '组件',
  },
  {
    field: 'externalLink',
    label: '外链地址',
  },
  {
    field: 'createdAt',
    label: '创建时间',
  },
  {
    field: 'updatedAt',
    label: '更新时间',
  },
];

/**
 * 新增/编辑表单
 */
const isMenu = (type: number) => {
  return type == 1;
};
const isExternalLink = (type: number) => {
  return type == 3;
};

export const insertOrUpdateFormSchema: FormSchema[] = [
  {
    field: 'id',
    // 只是为了带过来
    label: '主键ID',
    component: 'Render',
    ifShow: false,
  },
  {
    field: 'title',
    label: '菜单名称',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 50,
    },
  },
  {
    field: 'parentId',
    label: '上级菜单',
    required: false,
    component: 'TreeSelect',
    // 拉取树状数据放在 update-drawer.vue 中
  },
  {
    field: 'type',
    label: '菜单类型',
    component: 'RadioButtonGroup',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '目录', value: 0 },
        { label: '菜单', value: 1 },
        { label: '按钮', value: 2 },
        { label: '外链', value: 3 },
      ],
    },
  },
  {
    field: 'permission',
    label: '权限标识',
    required: false,
    component: 'Input',
    componentProps: {
      placeholder: '不要求权限就留空；需与后端接口注解value一致',
      maxlength: 255,
    },
  },
  {
    field: 'icon',
    label: '图标',
    required: false,
    component: 'IconPicker',
    componentProps: {},
  },
  {
    field: 'sort',
    label: '排序',
    required: true,
    component: 'InputNumber',
    componentProps: {},
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioButtonGroup',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '禁用', value: 0 },
        { label: '启用', value: 1 },
      ],
    },
  },
  {
    field: 'component',
    label: '组件',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 50,
    },
    // Helio: 只在选择“菜单”时显示
    ifShow: ({ values }) => isMenu(values.type),
  },
  {
    field: 'externalLink',
    label: '外链',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 255,
    },
    // Helio: 只在选择“外链”时显示
    ifShow: ({ values }) => isExternalLink(values.type),
  },
];
