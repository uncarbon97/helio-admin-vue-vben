import { BasicColumn, FormSchema } from '@/components/Table';
import { DescItem } from '@/components/Description';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '角色名',
    dataIndex: 'title',
    width: 80,
  },
  {
    title: '角色编码',
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
    label: '角色名',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'value',
    label: '角色编码',
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
    field: 'title',
    label: '角色名',
  },
  {
    field: 'value',
    label: '角色编码',
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
    field: 'title',
    label: '角色名',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 50,
    },
  },
  {
    field: 'value',
    label: '角色编码',
    required: true,
    component: 'Input',
    componentProps: {
      maxlength: 100,
    },
  },
];
