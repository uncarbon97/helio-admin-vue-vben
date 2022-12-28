import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '操作时间',
    dataIndex: 'createdAt',
    width: 80,
  },
  {
    title: '用户账号',
    dataIndex: 'username',
    width: 80,
  },
  {
    title: '操作内容',
    dataIndex: 'operation',
    width: 60,
  },
  {
    title: 'IP地址',
    dataIndex: 'ip',
    width: 50,
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
          color = 'yellow';
          text = '未执行';
          break;
        case 1:
          color = 'green';
          text = '成功';
          break;
        case 2:
          color = 'red';
          text = '失败';
          break;
      }
      return h(Tag, { color: color }, () => text);
    },
  },
];

/**
 * 查询条件
 */
export const queryFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '用户账号',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'operation',
    label: '操作内容',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '未执行', value: 0 },
        { label: '成功', value: 1 },
        { label: '失败', value: 2 },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: '[beginAt, endAt]',
    label: '操作时间区间',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: ['开始时间', '结束时间'],
      // 不显示时分秒部分
      showTime: false,
    },
    colProps: { span: 8 },
  },
];
