import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description';

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
    title: '键值',
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
    label: '键值',
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
    label: '主键ID(只是为了带过来)',
    component: 'Render',
    show: false,
  },
  {
    field: 'camelCaseKey',
    label: '驼峰式键名',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'underCaseKey',
    label: '下划线式键名',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'pascalCaseKey',
    label: '帕斯卡式键名',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'value',
    label: '键值',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'description',
    label: '描述',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'unit',
    label: '单位',
    required: false,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'valueRange',
    label: '取值范围',
    required: false,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'aliasKey',
    label: '别称键名',
    required: false,
    component: 'Input',
    componentProps: {},
  },
];
