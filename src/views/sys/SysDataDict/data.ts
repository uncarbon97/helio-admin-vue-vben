import { BasicColumn, FormSchema } from '@/components/Table';
import { DescItem } from '@/components/Description';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '分类编码',
    dataIndex: 'code',
    width: 80,
  },
  {
    title: '分类名称',
    dataIndex: 'name',
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
 * 查询条件
 */
export const queryFormSchema: FormSchema[] = [
  {
    field: 'code',
    label: '分类编码',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [];

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
    label: '分类编码',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'name',
    label: '分类名称',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'status',
    label: '状态',
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
    field: 'description',
    label: '分类描述',
    required: false,
    component: 'Input',
    componentProps: {},
  },
];
