import {BasicColumn, FormSchema} from '@/components/Table';
import {DescItem} from '@/components/Description';

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
    title: '值',
    dataIndex: 'value',
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
    field: 'title',
    label: '名称',
    component: 'Input',
    componentProps: {},
    colProps: {span: 8},
  },
  {
    field: 'value',
    label: '值',
    component: 'Input',
    componentProps: {},
    colProps: {span: 8},
  },
];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'title',
    label: '名称',
  },
  {
    field: 'value',
    label: '值',
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
    field: 'title',
    label: '名称',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'value',
    label: '值',
    required: true,
    component: 'Input',
    componentProps: {},
  },
];
