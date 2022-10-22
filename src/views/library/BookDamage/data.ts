import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description';
import { listBookOptionApi } from '/@/api/library/BookApi';
import { ref } from '@vue/runtime-core';
import { DEFAULT_SELECT_FIELD_NAMES } from '/@/helio/constants/fieldNamesConstant';

/*
---- 预加载书籍列表
 */
// 下拉框选项
const bookOptions = ref<any[]>([]);
// 书籍ID-标题 map
const bookIdTitleMap: Map<string, string> = new Map<string, string>();
async function updateBook() {
  const books = await listBookOptionApi();

  bookOptions.value = books;

  for (const each of books) {
    bookIdTitleMap.set(each.id, each.title);
  }
}
updateBook();

/**
 * 支持 Select 组件关键词搜索
 */
const filterBookOption = (input: string, option) => {
  return option.title.includes(input);
};

/**
 * 支持外部获取 bookIdTitleMap
 */
export const getBookIdTitleMap = () => {
  return bookIdTitleMap;
};

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '书籍名',
    dataIndex: 'bookTitle',
    width: 80,
  },
  {
    title: '报损数量',
    dataIndex: 'quantity',
    width: 80,
  },
  {
    title: '备注',
    dataIndex: 'remark',
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
    field: 'bookTitle',
    label: '书籍名',
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
    field: 'bookTitle',
    label: '书籍名',
  },
  {
    field: 'quantity',
    label: '报损数量',
  },
  {
    field: 'remark',
    label: '备注',
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
    field: 'bookId',
    label: '书籍',
    required: true,
    component: 'Select',
    componentProps: {
      options: bookOptions,
      fieldNames: DEFAULT_SELECT_FIELD_NAMES,
      // 以下两个属性结合，实现关键词搜索
      showSearch: true,
      filterOption: filterBookOption,
    },
  },
  {
    field: 'quantity',
    label: '报损数量',
    required: true,
    component: 'InputNumber',
    componentProps: {},
  },
  {
    field: 'remark',
    label: '备注',
    required: false,
    component: 'Input',
    componentProps: {},
  },
];
