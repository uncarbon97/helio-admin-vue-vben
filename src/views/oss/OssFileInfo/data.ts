import { BasicColumn, FormSchema } from '@/components/Table';
import { DescItem } from '@/components/Description';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '存储平台',
    dataIndex: 'storagePlatform',
    width: 80,
  },
  {
    title: '基础存储路径',
    dataIndex: 'storageBasePath',
    width: 80,
  },
  {
    title: '存储路径',
    dataIndex: 'storagePath',
    width: 80,
  },
  {
    title: '存储文件名',
    dataIndex: 'storageFilename',
    width: 80,
  },
  {
    title: '原始文件名',
    dataIndex: 'originalFilename',
    width: 80,
  },
  {
    title: '扩展名',
    dataIndex: 'extendName',
    width: 80,
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
    width: 80,
    customRender: ({ record }) => {
      return (record.fileSize / 1024 / 1024).toFixed(2) + ' MB';
    },
  },
  {
    title: 'MD5',
    dataIndex: 'md5',
    width: 80,
  },
  {
    title: '文件类别',
    dataIndex: 'classified',
    width: 80,
  },
  {
    title: '对象存储直链',
    dataIndex: 'directUrl',
    width: 80,
  },
  {
    title: '上传时间',
    dataIndex: 'createdAt',
    width: 80,
  },
];

/**
 * 查询条件
 */
export const queryFormSchema: FormSchema[] = [
  {
    field: 'originalFilename',
    label: '原始文件名',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'extendName',
    label: '扩展名',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'classified',
    label: '文件类别',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: '[beginAt, endAt]',
    label: '上传时间区间',
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

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'storagePlatform',
    label: '存储平台',
  },
  {
    field: 'storageBasePath',
    label: '基础存储路径',
  },
  {
    field: 'storagePath',
    label: '存储路径',
  },
  {
    field: 'storageFilename',
    label: '存储文件名',
  },
  {
    field: 'originalFilename',
    label: '原始文件名',
  },
  {
    field: 'extendName',
    label: '扩展名',
  },
  {
    field: 'fileSize',
    label: '文件大小',
    render(val) {
      return (val / 1024 / 1024).toFixed(2) + ' MB';
    },
  },
  {
    field: 'md5',
    label: 'MD5',
  },
  {
    field: 'classified',
    label: '文件类别',
  },
  {
    field: 'directUrl',
    label: '对象存储直链',
  },
  {
    field: 'createdAt',
    label: '上传时间',
  },
];
