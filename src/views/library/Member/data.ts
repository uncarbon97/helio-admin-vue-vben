import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '学号/工号',
    dataIndex: 'username',
    width: 80,
  },
  {
    title: '真实姓名',
    dataIndex: 'realName',
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
          text = '封禁';
          break;
        case 1:
          color = 'green';
          text = '正常';
          break;
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '性别',
    dataIndex: 'gender',
    width: 80,
    customRender: ({ record }) => {
      const value = record.gender;
      let color, text;

      switch (value) {
        case 0:
          color = 'gray';
          text = '未知';
          break;
        case 1:
          color = 'blue';
          text = '男';
          break;
        case 2:
          color = 'pink';
          text = '女';
          break;
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '手机号',
    dataIndex: 'phoneNo',
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
    field: 'username',
    label: '学号/工号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 6 },
  },
  {
    field: 'realName',
    label: '真实姓名',
    component: 'Input',
    componentProps: {},
    colProps: { span: 6 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '正常', value: 1 },
        { label: '封紧', value: 0 },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'gender',
    label: '性别',
    component: 'Select',
    componentProps: {
      options: [
        { label: '未知', value: 0 },
        { label: '男', value: 1 },
        { label: '女', value: 2 },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'phoneNo',
    label: '手机号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 6 },
  },
];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'username',
    label: '学号/工号',
  },
  {
    field: 'realName',
    label: '真实姓名',
  },
  {
    field: 'status',
    label: '状态',
    render(val) {
      return val === 0 ? '封紧' : '正常';
    },
  },
  {
    field: 'genderLabel',
    label: '性别',
  },
  {
    field: 'phoneNo',
    label: '手机号',
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
    field: 'username',
    label: '学号/工号',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'realName',
    label: '真实姓名',
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
        { label: '封禁', value: 0 },
        { label: '正常', value: 1 },
      ],
    },
  },
  {
    field: 'gender',
    label: '性别',
    required: false,
    component: 'RadioButtonGroup',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '未知', value: 0 },
        { label: '男', value: 1 },
        { label: '女', value: 2 },
      ],
    },
  },
  {
    field: 'phoneNo',
    label: '手机号',
    required: false,
    component: 'Input',
    componentProps: {},
  },
];
