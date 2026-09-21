import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
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
      fieldName: 'userPin',
      label: $t('sys.operateLog.userPin'),
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
 * @param onActionClick 操作列点击回调
 */
export function useColumns<T = SysOperateLogApi.SysOperateLogDTO>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridColumns {
  return [
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
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
      field: 'userPin',
      title: $t('sys.operateLog.userPin'),
      width: 140,
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
      field: 'failedMsg',
      minWidth: 200,
      title: $t('sys.operateLog.failedMsg'),
    },
    {
      // 操作列
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'userPin',
          nameTitle: $t('sys.operateLog.userPin'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['detail'],
      },
      field: 'action',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('sys.operateLog.action'),
      width: 90,
    },
  ];
}
