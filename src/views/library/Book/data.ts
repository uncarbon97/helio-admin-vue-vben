import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description';
import { h, ref, VNode } from 'vue';
import { Image, Tag, Typography, TypographyParagraph } from 'ant-design-vue';
import { listBookClassifiedOptionApi } from '/@/api/library/BookClassifiedApi';
import { TreeDataNode } from 'ant-design-vue/es/vc-tree-select/interface';
import { list2Tree } from '/@/helio/converter/bizDataStructConverter';
import { DEFAULT_TREE_SELECT_FIELD_NAMES } from '/@/helio/constants/fieldNamesConstant';
import { uploadApi } from '/@/api/sys/upload';
import { RenderCallbackParams } from '/@/components/Form';

/*
---- 预加载书籍类别
 */
// 树状下拉框选项
const bookClassifiedTreeData = ref<any[]>([]);
// 书籍类别ID-标题 map
const bookClassifiedIdTitleMap: Map<string, string> = new Map<string, string>();
async function updateBookClassified() {
  const bookClassifieds = await listBookClassifiedOptionApi();

  // 转成树状数据
  bookClassifiedTreeData.value = list2Tree(bookClassifieds);

  for (const each of bookClassifieds) {
    bookClassifiedIdTitleMap.set(each.id, each.title);
  }
}
updateBookClassified();

/**
 * 支持 TreeSelect 组件关键词搜索
 */
const filterBookClassifiedTreeData = (input: string, treeNode: TreeDataNode) => {
  return treeNode.title.includes(input);
};

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '书籍名',
    dataIndex: 'title',
    width: 80,
  },
  {
    title: 'ISBN号',
    dataIndex: 'isbn',
    width: 80,
  },
  {
    title: '出版社',
    dataIndex: 'publisher',
    width: 80,
  },
  {
    title: '作者名',
    dataIndex: 'author',
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
          text = '无效';
          break;
        case 1:
          color = 'green';
          text = '有效';
          break;
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: '总数量',
    dataIndex: 'totalQuantity',
    width: 80,
  },
  {
    title: '被借阅数量',
    dataIndex: 'borrowedQuantity',
    width: 80,
  },
  {
    title: '被损坏数量',
    dataIndex: 'damagedQuantity',
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
    label: '书籍名',
    component: 'Input',
    componentProps: {},
    colProps: { span: 5 },
  },
  {
    field: 'author',
    label: '作者名',
    component: 'Input',
    componentProps: {},
    colProps: { span: 5 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '有效', value: 1 },
        { label: '无效', value: 0 },
      ],
    },
    colProps: { span: 5 },
  },
  {
    field: 'bookClassifiedId',
    label: '书籍类别',
    component: 'TreeSelect',
    componentProps: {
      treeData: bookClassifiedTreeData,
      fieldNames: DEFAULT_TREE_SELECT_FIELD_NAMES,
      // 以下两个属性结合，实现关键词搜索
      showSearch: true,
      filterTreeNode: filterBookClassifiedTreeData,
    },
    colProps: { span: 7 },
  },
];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'title',
    label: '书籍名',
    // 左侧标签宽度，第一个设置了就行
    labelMinWidth: 120,
  },
  {
    field: 'isbn',
    label: 'ISBN号',
  },
  {
    field: 'publisher',
    label: '出版社',
  },
  {
    field: 'author',
    label: '作者名',
  },
  {
    field: 'bookClassifiedId',
    label: '书籍类别',
    // 将 fieldValue（类别ID）换成类别名
    render: (val) => {
      return bookClassifiedIdTitleMap.get(val);
    },
  },
  {
    field: 'unitPrice',
    label: '单价',
  },
  {
    field: 'status',
    label: '状态',
    render: (val) => {
      return val === 1 ? '有效' : '无效';
    },
  },
  {
    field: 'coverImgUrl',
    label: '封面图片',
    render: (val) => {
      return h(Image, { src: val, width: 150 });
    },
  },
  {
    field: 'description',
    label: '描述',
    render: (val) => {
      // 第一次打开，val 可能会是 undefined，过滤一下
      if (!val) return;

      return h(Typography, {}, () => {
        // 根据换行符分成多段显示描述
        const rows: string[] = val.split('\n');
        const paragraphs: VNode[] = [];
        for (const row of rows) {
          paragraphs.push(h(TypographyParagraph, { content: row }));
        }

        return paragraphs;
      });
    },
  },
  {
    field: 'totalQuantity',
    label: '总数量',
  },
  {
    field: 'borrowedQuantity',
    label: '被借阅数量',
  },
  {
    field: 'damagedQuantity',
    label: '被损坏数量',
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
    field: 'title',
    label: '书籍名',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'isbn',
    label: 'ISBN号',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'publisher',
    label: '出版社',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'author',
    label: '作者名',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'bookClassifiedId',
    label: '书籍类别',
    required: true,
    component: 'TreeSelect',
    componentProps: {
      treeData: bookClassifiedTreeData,
      fieldNames: DEFAULT_TREE_SELECT_FIELD_NAMES,
      // 以下两个属性结合，实现关键词搜索
      showSearch: true,
      filterTreeNode: filterBookClassifiedTreeData,
    },
  },
  {
    field: 'unitPrice',
    label: '单价',
    required: true,
    component: 'InputNumber',
    colProps: { span: 24 },
    componentProps: {
      prefix: '￥',
      precision: 2,
    },
  },
  {
    field: 'status',
    label: '状态',
    required: false,
    component: 'RadioButtonGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '有效', value: 1 },
        { label: '无效', value: 0 },
      ],
    },
  },
  {
    field: 'coverImgUrl',
    label: '当前封面图片预览',
    component: 'Input',
    render: (val) => {
      // val.values.coverImgUrl 是通过控制台打印 val 得知的
      return h(Image, { src: val.values.coverImgUrl, width: 150 });
    },
    ifShow: (val: RenderCallbackParams) => {
      // 仅当封面图片有值时，才渲染图片组件
      return !!val.values.coverImgUrl;
    },
  },
  {
    field: 'coverImgUpload',
    label: '封面图片',
    component: 'Upload',
    rules: [{ required: true, message: '请选择上传文件' }],
    componentProps: {
      api: async (params, onUploadProgress) => {
        // 指定文件类别为书籍封面
        params.data.classified = 'book_cover_img';
        return uploadApi(params, onUploadProgress);
      },
      // 最多上传1张封面
      maxNumber: 1,
      // 文件后缀
      accept: ['JPG', 'PNG'],
      // 仅单选
      multiple: false,
    },
    ifShow: (val: RenderCallbackParams) => {
      // 新增时使用本组件，强制要求上传封面图片
      return !val.values.id;
    },
  },
  {
    field: 'coverImgUpload',
    label: '更新封面图片',
    component: 'Upload',
    rules: [{ required: false, message: '请选择上传文件' }],
    componentProps: {
      api: uploadApi,
      // 最多上传1张封面
      maxNumber: 1,
      // 文件后缀
      accept: ['JPG', 'PNG'],
      // 仅单选
      multiple: false,
    },
    ifShow: (val: RenderCallbackParams) => {
      // 编辑时使用本组件，不强制要求上传封面图片
      return !!val.values.id;
    },
  },
  {
    field: 'description',
    label: '描述',
    required: true,
    component: 'InputTextArea',
    componentProps: {
      // https://www.antdv.com/components/input-cn#components-input-demo-autosize-textarea
      autoSize: { minRows: 12, maxRows: 12 },
    },
  },
  {
    field: 'totalQuantity',
    label: '总数量',
    required: true,
    component: 'InputNumber',
    componentProps: {
      precision: 0,
    },
  },
];
