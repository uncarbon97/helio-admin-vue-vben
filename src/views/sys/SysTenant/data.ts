import { BasicColumn, FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { DescItem } from '/@/components/Description';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '租户名',
    dataIndex: 'tenantName',
    width: 80,
  },
  {
    title: '租户ID',
    dataIndex: 'tenantId',
    width: 80,
  },
  {
    title: '管理员账号',
    dataIndex: ['tenantAdminUser', 'username'],
    width: 80,
  },
  {
    title: '管理员手机号',
    dataIndex: ['tenantAdminUser', 'phoneNo'],
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
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 80,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 80,
  },
];

/**
 * 查询条件
 */
export const queryFormSchema: FormSchema[] = [
  {
    field: 'tenantName',
    label: '租户名',
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
    field: 'tenantName',
    label: '租户名',
  },
  {
    field: 'tenantId',
    label: '租户ID',
  },
  {
    field: 'statusLabel',
    label: '状态',
  },
  {
    field: 'tenantAdminUser.username',
    label: '管理员账号',
    render: (_, record) => {
      // 因为查看详情有调用接口，存在网络延时，使用可选链避免报错
      return record?.tenantAdminUser?.username;
    },
  },
  {
    field: 'tenantAdminUser.phoneNo',
    label: '管理员手机号',
    render: (_, record) => {
      return record?.tenantAdminUser?.phoneNo;
    },
  },
  {
    field: 'tenantAdminUser.email',
    label: '管理员邮箱',
    render: (_, record) => {
      return record?.tenantAdminUser?.email;
    },
  },
  {
    field: 'createdAt',
    label: '创建时间',
  },
  {
    field: 'updatedAt',
    label: '更新时间',
  },
  {
    field: 'remark',
    label: '备注',
  },
];

/**
 * 新增/编辑表单
 */
const isUpdateView = (id: string) => {
  return !!id;
};
export const insertOrUpdateFormSchema: FormSchema[] = [
  {
    field: 'id',
    label: '主键ID(只是为了带过来)',
    component: 'Render',
    show: false,
  },
  {
    field: 'tenantName',
    label: '租户名',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'tenantId',
    label: '租户ID',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '纯数字',
    },
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
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    componentProps: {},
  },
  {
    field: 'tenantAdminUsername',
    label: '管理员账号',
    required: true,
    component: 'Input',
    componentProps: {},
    // Helio: 只在新增时显示
    ifShow: ({ values }) => !isUpdateView(values.id),
  },
  {
    field: 'tenantAdminPassword',
    label: '管理员密码',
    required: true,
    component: 'InputPassword',
    componentProps: {
      placeholder: '建议使用强密码',
    },
    // Helio: 只在新增时显示
    ifShow: ({ values }) => !isUpdateView(values.id),
  },
  {
    field: 'tenantAdminEmail',
    label: '管理员邮箱',
    required: true,
    component: 'Input',
    componentProps: {},
    // Helio: 只在新增时显示
    ifShow: ({ values }) => !isUpdateView(values.id),
  },
  {
    field: 'tenantAdminPhoneNo',
    label: '管理员手机号',
    required: true,
    component: 'Input',
    componentProps: {},
    // Helio: 只在新增时显示
    ifShow: ({ values }) => !isUpdateView(values.id),
  },
];
