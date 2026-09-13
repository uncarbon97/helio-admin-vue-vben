// adapt to helium: 操作日志表格/查询条件配置
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysOperateLogApi } from '#/api';

import { LogResultStatusEnum } from '#/api';
import { $t } from '#/locales';

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'bizType',
      label: $t('sys.operateLog.bizType'),
    },
    {
      component: 'Input',
      fieldName: 'behavior',
      label: $t('sys.operateLog.behavior'),
    },
    {
      component: 'Input',
      fieldName: 'bizNo',
      label: $t('sys.operateLog.bizNo'),
    },
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('sys.operateLog.userId'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('sys.operateLog.resultSuccess'),
            value: LogResultStatusEnum.SUCCESS,
          },
          {
            label: $t('sys.operateLog.resultFailed'),
            value: LogResultStatusEnum.FAILED,
          },
        ],
      },
      fieldName: 'resultStatus',
      label: $t('sys.operateLog.resultStatus'),
    },
    {
      component: 'RangePicker',
      componentProps: {
        showTime: true,
      },
      fieldName: 'createdAtRange',
      label: $t('sys.operateLog.createdAt'),
    },
  ];
}

/**
 * 表格列
 * @returns
 */
export function useColumns<T = SysOperateLogApi.SysOperateLogDTO>(): VxeTableGridColumns {
  return [
    {
      field: 'createdAt',
      title: $t('sys.operateLog.createdAt'),
      width: 200,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'success',
            label: $t('sys.operateLog.resultSuccess'),
            value: LogResultStatusEnum.SUCCESS,
          },
          {
            color: 'error',
            label: $t('sys.operateLog.resultFailed'),
            value: LogResultStatusEnum.FAILED,
          },
        ],
      },
      field: 'resultStatus',
      title: $t('sys.operateLog.resultStatus'),
      width: 90,
    },
    {
      field: 'bizType',
      title: $t('sys.operateLog.bizType'),
      width: 140,
    },
    {
      field: 'behavior',
      title: $t('sys.operateLog.behavior'),
      width: 110,
    },
    {
      field: 'bizNo',
      title: $t('sys.operateLog.bizNo'),
      width: 160,
    },
    {
      field: 'operation',
      minWidth: 200,
      title: $t('sys.operateLog.operation'),
    },
    {
      field: 'userId',
      title: $t('sys.operateLog.userId'),
      width: 140,
    },
    {
      field: 'requestMethod',
      title: $t('sys.operateLog.requestMethod'),
      width: 110,
    },
    {
      field: 'requestPath',
      minWidth: 200,
      title: $t('sys.operateLog.requestPath'),
    },
    {
      field: 'visitorIp',
      title: $t('sys.operateLog.visitorIp'),
      width: 140,
    },
    {
      field: 'visitorIpLocation',
      minWidth: 140,
      title: $t('sys.operateLog.visitorIpLocation'),
    },
    {
      field: 'visitorUserAgent',
      minWidth: 200,
      title: $t('sys.operateLog.visitorUserAgent'),
    },
    {
      field: 'failedMsg',
      minWidth: 200,
      title: $t('sys.operateLog.failedMsg'),
    },
  ];
}
