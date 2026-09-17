import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { FileMetaApi } from '#/api';

import { $t } from '#/locales';

/**
 * 文件大小格式化（字节 -> 人类可读）
 */
export function formatFileSize(size: number | undefined): string {
  if (!size || size <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  return `${(size / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 2)} ${
    units[exponent]
  }`;
}

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      // 存储点下拉筛选（选项由 index.vue 异步注入）
      component: 'Select',
      fieldName: 'storageCode',
      label: $t('file.meta.storageCode'),
      componentProps: {
        allowClear: true,
        options: [],
      },
    },
    {
      component: 'Input',
      fieldName: 'extendName',
      label: $t('file.meta.extendName'),
    },
    {
      component: 'Input',
      fieldName: 'category',
      label: $t('file.meta.category'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick
 * @param hasDelete 是否有删除权限
 */
export function useColumns<T = FileMetaApi.FileMetaDTO>(
  onActionClick: OnActionClickFn<T>,
  hasDelete: boolean,
): VxeTableGridColumns {
  return [
    {
      field: 'originalFilename',
      title: $t('file.meta.originalFilename'),
      minWidth: 220,
      formatter: ({ row }) => {
        const r = row as FileMetaApi.FileMetaDTO;
        return r.extendName
          ? `${r.originalFilename}.${r.extendName}`
          : r.originalFilename;
      },
    },
    {
      field: 'category',
      title: $t('file.meta.category'),
      width: 120,
    },
    {
      field: 'fileSize',
      title: $t('file.meta.fileSize'),
      width: 110,
      formatter: ({ cellValue }) => formatFileSize(cellValue),
    },
    {
      field: 'storageCode',
      title: $t('file.meta.storageCode'),
      width: 160,
    },
    {
      className: 'truncate',
      field: 'directUrl',
      minWidth: 200,
      title: $t('file.meta.directUrl'),
    },
    {
      field: 'createdAt',
      title: $t('file.meta.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'originalFilename',
          nameTitle: $t('file.meta.originalFilename'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'copyLink', text: $t('file.meta.copyLink') },
          ...(hasDelete ? ['delete'] : []),
        ],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('file.meta.operation'),
      width: 160,
    },
  ];
}
