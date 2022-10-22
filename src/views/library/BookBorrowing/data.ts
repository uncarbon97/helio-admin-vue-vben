import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description';
import { ref } from '@vue/runtime-core';
import { listBookOptionApi } from '/@/api/library/BookApi';
import { DEFAULT_SELECT_FIELD_NAMES } from '/@/helio/constants/fieldNamesConstant';
import { listMemberOptionApi } from '/@/api/library/MemberApi';
import { BookApiResult } from '/@/api/library/model/BookModel';
import { MemberApiResult } from '/@/api/library/model/MemberModel';
import dayjs from 'dayjs';

/*
---- 预加载书籍列表
 */
// 下拉框选项
const bookOptions = ref<any[]>([]);
// 书籍ID-书籍对象 map
const bookObjectMap: Map<string, BookApiResult> = new Map<string, BookApiResult>();
export async function updateBook() {
  const books = await listBookOptionApi();

  bookOptions.value = books;

  for (const each of books) {
    bookObjectMap.set(each.id, each);
  }
}
updateBook();

/**
 * 支持 Select 组件关键词搜索
 */
const filterOption = (input: string, option) => {
  return option.title.includes(input);
};

/**
 * 支持外部获取 bookObjectMap
 */
export const getBookObjectMap = () => {
  return bookObjectMap;
};

/*
---- 预加载会员列表
 */
// 下拉框选项
const memberOptions = ref<any[]>([]);
// 会员ID-会员对象 map
const memberObjectMap: Map<string, MemberApiResult> = new Map<string, MemberApiResult>();
export async function updateMember() {
  const members = await listMemberOptionApi();

  for (const each of members) {
    // 方便前端选择
    each.title = each.username + '----' + each.realName;

    memberObjectMap.set(each.id, each);
  }

  memberOptions.value = members;
}
updateMember();

/**
 * 支持外部获取 memberObjectMap
 */
export const getMemberObjectMap = () => {
  return memberObjectMap;
};

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '会员学号/工号',
    dataIndex: 'memberUsername',
    width: 80,
  },
  {
    title: '会员真实姓名',
    dataIndex: 'memberRealName',
    width: 80,
  },
  {
    title: '书籍名',
    dataIndex: 'bookTitle',
    width: 80,
  },
  {
    title: '书籍ISBN号',
    dataIndex: 'bookIsbn',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'statusLabel',
    width: 80,
  },
  {
    title: '借阅数量',
    dataIndex: 'quantity',
    width: 80,
  },
  {
    title: '借阅时间',
    dataIndex: 'borrowAt',
    width: 80,
  },
  {
    title: '借阅时长(天)',
    dataIndex: 'borrowDuration',
    width: 80,
  },
  {
    title: '约定归还时间',
    dataIndex: 'appointedReturnAt',
    width: 80,
  },
  {
    title: '实际归还时间',
    dataIndex: 'actualReturnAt',
    width: 80,
  },
];

/**
 * 查询条件
 */
export const queryFormSchema: FormSchema[] = [
  {
    field: 'memberUsername',
    label: '会员学号/工号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'memberRealName',
    label: '会员真实姓名',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'bookId',
    label: '书籍',
    component: 'Select',
    componentProps: {
      options: bookOptions,
      fieldNames: DEFAULT_SELECT_FIELD_NAMES,
      // 以下两个属性结合，实现关键词搜索
      showSearch: true,
      filterOption: filterOption,
    },
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '借阅中', value: 1 },
        { label: '已归还', value: 2 },
        { label: '已逾期', value: 3 },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'queryPeriodType',
    label: '时间区间类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '借阅时间', value: 1 },
        { label: '约定归还时间', value: 2 },
        { label: '实际归还时间', value: 3 },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: '[beginAt, endAt]',
    label: '时间区间',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: ['开始时间', '结束时间'],
      // 不显示时分秒部分
      showTime: false,
    },
    colProps: { span: 8 },
    dynamicRules: ({ values }) => {
      return [
        {
          required: false,
          validator: (_, value) => {
            if (value && !values.queryPeriodType) {
              return Promise.reject('未选择左侧的“时间区间类型”');
            }
            return Promise.resolve();
          },
        },
      ];
    },
  },
];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'memberId',
    label: '会员ID',
  },
  {
    field: 'memberUsername',
    label: '会员学号/工号',
  },
  {
    field: 'memberRealName',
    label: '会员真实姓名',
  },
  {
    field: 'bookId',
    label: '书籍ID',
  },
  {
    field: 'bookTitle',
    label: '书籍名',
  },
  {
    field: 'bookIsbn',
    label: '书籍ISBN号',
  },
  {
    field: 'statusLabel',
    label: '状态',
  },
  {
    field: 'quantity',
    label: '借阅数量',
  },
  {
    field: 'borrowAt',
    label: '借阅时间',
  },
  {
    field: 'borrowDuration',
    label: '借阅时长(天)',
  },
  {
    field: 'appointedReturnAt',
    label: '约定归还时间',
  },
  {
    field: 'actualReturnAt',
    label: '实际归还时间',
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
    field: 'memberId',
    label: '会员',
    required: true,
    component: 'Select',
    componentProps: {
      options: memberOptions,
      fieldNames: DEFAULT_SELECT_FIELD_NAMES,
      // 以下两个属性结合，实现关键词搜索
      showSearch: true,
      filterOption: filterOption,
    },
  },
  {
    field: 'bookId',
    label: '书籍',
    required: true,
    component: 'Select',
    componentProps: {
      options: bookOptions,
      fieldNames: DEFAULT_SELECT_FIELD_NAMES,
      // 以下两个属性结合，实现关键词搜索
      showSearch: true,
      filterOption: filterOption,
    },
  },
  {
    field: 'quantity',
    label: '借阅数量',
    required: true,
    component: 'InputNumber',
    componentProps: {},
  },
  {
    field: 'borrowAt',
    label: '借阅时间',
    required: true,
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      // 显示时分秒部分
      showTime: true,
    },
  },
  {
    field: 'borrowDuration',
    label: '借阅时长(天)',
    required: true,
    component: 'InputNumber',
    componentProps: ({ formModel }) => {
      // 代码参考自 src/views/demo/form/index.vue 省份与城市联动
      return {
        onChange: (value: any) => {
          // 借阅时长变动时，约定归还时间跟随计算变动
          if (!formModel.borrowAt) return;
          formModel.appointedReturnAt = dayjs(formModel.borrowAt).add(value, 'day');
        },
      };
    },
  },
  {
    field: 'appointedReturnAt',
    label: '约定归还时间',
    required: true,
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
  },
];
