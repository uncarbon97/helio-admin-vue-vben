import { BasicColumn, FormSchema } from '@/components/Table';
import {h} from "vue";
import {Tag} from "ant-design-vue";

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '字典项编码',
    dataIndex: 'code',
    width: 80,
  },
  {
    title: '字典项标签',
    dataIndex: 'label',
    width: 80,
  },
  {
    title: '字典项值',
    dataIndex: 'value',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 50,
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
    width: 80,
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 80,
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
    ifShow: false,
  },
  {
    field: 'code',
    label: '字典项编码',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'label',
    label: '字典项标签',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'value',
    label: '字典项值',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'status',
    label: '状态',
    required: false,
    component: 'RadioButtonGroup',
    defaultValue: 1,
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
    defaultValue: 1,
  },
  {
    field: 'description',
    label: '描述',
    required: false,
    component: 'Input',
    componentProps: {},
  },
];
