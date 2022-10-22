import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'title',
    width: 80,
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
    title: '描述',
    dataIndex: 'description',
    width: 80,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 80,
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
    label: '名称',
  },
  {
    field: 'statusLabel',
    label: '状态',
  },
  {
    field: 'description',
    label: '描述',
  },
  {
    field: 'sort',
    label: '排序',
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
export const insertOrUpdateFormSchema: FormSchema[] = [
  {
    field: 'id',
    // 只是为了把ID带过来
    label: '主键ID',
    component: 'Render',
    show: false,
  },
  {
    field: 'title',
    label: '名称',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'status',
    label: '状态',
    required: false,
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
    field: 'sort',
    label: '排序',
    required: true,
    component: 'InputNumber',
    componentProps: {},
  },
  {
    field: 'description',
    label: '描述',
    required: false,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'parentId',
    label: '上级类别',
    required: false,
    component: 'TreeSelect',
    // 拉取树状数据放在drawer.vue中
  },
];
