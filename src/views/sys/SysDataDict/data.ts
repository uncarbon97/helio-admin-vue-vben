import { BasicColumn, FormSchema } from '@/components/Table';
import { DescItem } from '@/components/Description';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '驼峰式键名',
    dataIndex: 'camelCaseKey',
    width: 80,
  },
  {
    title: '下划线式键名',
    dataIndex: 'underCaseKey',
    width: 80,
  },
  {
    title: '帕斯卡式键名',
    dataIndex: 'pascalCaseKey',
    width: 80,
  },
  {
    title: '数据值',
    dataIndex: 'value',
    width: 80,
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 80,
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 80,
  },
  {
    title: '取值范围',
    dataIndex: 'valueRange',
    width: 80,
  },
  {
    title: '别称键名',
    dataIndex: 'aliasKey',
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
    field: 'description',
    label: '描述',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'camelCaseKey',
    label: '驼峰式键名',
  },
  {
    field: 'underCaseKey',
    label: '下划线式键名',
  },
  {
    field: 'pascalCaseKey',
    label: '帕斯卡式键名',
  },
  {
    field: 'value',
    label: '数据值',
  },
  {
    field: 'description',
    label: '描述',
  },
  {
    field: 'unit',
    label: '单位',
  },
  {
    field: 'valueRange',
    label: '取值范围',
  },
  {
    field: 'aliasKey',
    label: '别称键名',
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
    // 只是为了带过来
    label: '主键ID',
    component: 'Render',
    ifShow: false,
  },
  {
    field: 'camelCaseKey',
    label: '驼峰式键名',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 100,
    },
  },
  {
    field: 'underCaseKey',
    label: '下划线式键名',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 100,
    },
  },
  {
    field: 'pascalCaseKey',
    label: '帕斯卡式键名',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 100,
    },
  },
  {
    field: 'value',
    label: '数据值',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 255,
    },
  },
  {
    field: 'description',
    label: '描述',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 255,
    },
  },
  {
    field: 'unit',
    label: '单位',
    required: false,
    component: 'Input',
    componentProps: {
      maxlength: 30,
    },
  },
  {
    field: 'valueRange',
    label: '取值范围',
    required: false,
    component: 'Input',
    componentProps: {
      maxlength: 255,
    },
  },
  {
    field: 'aliasKey',
    label: '别称键名',
    required: false,
    component: 'Input',
    componentProps: {
      maxlength: 100,
    },
  },
];
