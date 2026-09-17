// adapt to helium: 文件存储点管理表格/查询条件/表单配置
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { FileStorageApi, PlatformTypeEnumValue } from '#/api';

import { PlatformTypeEnum, YesOrNoEnum } from '#/api';
import { $t } from '#/locales';

/** 存储平台类型选项 */
export const PLATFORM_TYPE_OPTIONS: {
  label: string;
  value: PlatformTypeEnumValue;
}[] = [
  { label: $t('file.storage.platformLocal'), value: PlatformTypeEnum.LOCAL },
  { label: $t('file.storage.platformS3'), value: PlatformTypeEnum.AMAZON_S3 },
  {
    label: $t('file.storage.platformS3V2'),
    value: PlatformTypeEnum.AMAZON_S3_V2,
  },
  {
    label: $t('file.storage.platformAliyunOss'),
    value: PlatformTypeEnum.ALIYUN_OSS,
  },
];

/** 主存储点标识选项 */
export const YES_OR_NO_OPTIONS = [
  { label: $t('common.yes'), value: YesOrNoEnum.YES },
  { label: $t('common.no'), value: YesOrNoEnum.NO },
];

/**
 * 各存储平台类型的配置属性字段（用于表单动态显隐）
 */
export const SETTING_FIELDS: Record<PlatformTypeEnumValue, string[]> = {
  [PlatformTypeEnum.LOCAL]: ['basePath', 'storagePath', 'domain'],
  [PlatformTypeEnum.AMAZON_S3]: [
    'accessKey',
    'secretKey',
    'region',
    'endPoint',
    'bucketName',
    'domain',
    'basePath',
    'defaultAcl',
  ],
  [PlatformTypeEnum.AMAZON_S3_V2]: [
    'accessKey',
    'secretKey',
    'region',
    'endPoint',
    'bucketName',
    'domain',
    'basePath',
    'defaultAcl',
  ],
  [PlatformTypeEnum.ALIYUN_OSS]: [
    'accessKey',
    'secretKey',
    'endPoint',
    'bucketName',
    'domain',
    'basePath',
    'defaultAcl',
  ],
};

/** 全部配置属性字段（去重） */
export const ALL_SETTING_FIELDS = [
  ...new Set(Object.values(SETTING_FIELDS).flat()),
];

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('file.storage.name'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('file.storage.code'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: PLATFORM_TYPE_OPTIONS,
      },
      fieldName: 'platformType',
      label: $t('file.storage.platformType'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick
 * @param hasUpdate 是否有修改权限
 * @param hasDelete 是否有删除权限
 * @returns
 */
export function useColumns<T = FileStorageApi.FileStorageDTO>(
  onActionClick: OnActionClickFn<T>,
  hasUpdate: boolean,
  hasDelete: boolean,
): VxeTableGridColumns {
  return [
    {
      field: 'code',
      title: $t('file.storage.code'),
      width: 200,
    },
    {
      field: 'name',
      minWidth: 160,
      title: $t('file.storage.name'),
    },
    {
      cellRender: {
        name: 'CellTag',
        options: PLATFORM_TYPE_OPTIONS.map((item) => ({
          color: 'processing',
          label: item.label,
          value: item.value,
        })),
      },
      field: 'platformType',
      title: $t('file.storage.platformType'),
      width: 140,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'success',
            label: $t('common.yes'),
            value: YesOrNoEnum.YES,
          },
          { color: 'default', label: $t('common.no'), value: YesOrNoEnum.NO },
        ],
      },
      field: 'primaryFlag',
      title: $t('file.storage.primaryFlag'),
      width: 110,
    },
    {
      field: 'createdAt',
      title: $t('file.storage.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('file.storage.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          ...(hasUpdate ? ['edit'] : []),
          // 测试上传（调用上传文件接口，验证存储点可用性）
          ...(hasUpdate
            ? [{ code: 'testUpload', text: $t('file.storage.testUpload') }]
            : []),
          ...(hasDelete ? ['delete'] : []),
        ],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('file.storage.operation'),
      width: 200,
    },
  ];
}

/**
 * 新增/修改表单（配置属性动态字段由 form.vue 控制显隐）
 * @param onPlatformTypeChange 存储平台类型切换回调（用于联动配置属性字段显隐）
 */
export function useFormSchema(
  onPlatformTypeChange?: (value: PlatformTypeEnumValue) => void,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        maxlength: 100,
      },
      fieldName: 'code',
      label: $t('file.storage.code'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 50,
      },
      fieldName: 'name',
      label: $t('file.storage.name'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        onChange: onPlatformTypeChange,
        options: PLATFORM_TYPE_OPTIONS,
      },
      fieldName: 'platformType',
      label: $t('file.storage.platformType'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        class: 'w-auto',
        options: YES_OR_NO_OPTIONS,
      },
      defaultValue: YesOrNoEnum.NO,
      fieldName: 'primaryFlag',
      label: $t('file.storage.primaryFlag'),
      rules: 'required',
    },
    // 以下为配置属性动态字段
    {
      component: 'Input',
      fieldName: 'endPoint',
      label: $t('file.storage.endPoint'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'bucketName',
      label: $t('file.storage.bucketName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'accessKey',
      label: $t('file.storage.accessKey'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'secretKey',
      label: $t('file.storage.secretKey'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'basePath',
      label: $t('file.storage.basePath'),
    },
    {
      component: 'Input',
      fieldName: 'storagePath',
      label: $t('file.storage.storagePath'),
      rules: 'required',
    },
    {
      component: 'Input',
      description: $t('file.storage.domainTip'),
      fieldName: 'domain',
      label: $t('file.storage.domain'),
    },
    {
      component: 'Input',
      fieldName: 'region',
      label: $t('file.storage.region'),
    },
    {
      component: 'Input',
      fieldName: 'defaultAcl',
      label: $t('file.storage.defaultAcl'),
    },
  ];
}
