import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysLoginLogApi } from '#/api';

import { LoginLogTypeEnum, LogResultStatusEnum } from '#/api';
import { $t } from '#/locales';

/**
 * 上方查询条件
 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'userPin',
      label: $t('sys.loginLog.userPin'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('sys.loginLog.resultSuccess'),
            value: LogResultStatusEnum.SUCCESS,
          },
          {
            label: $t('sys.loginLog.resultFailed'),
            value: LogResultStatusEnum.FAILED,
          },
        ],
      },
      fieldName: 'resultStatus',
      label: $t('sys.loginLog.resultStatus'),
    },
    {
      component: 'RangePicker',
      componentProps: {
        showTime: true,
      },
      fieldName: 'createdAtRange',
      label: $t('sys.loginLog.createdAt'),
    },
  ];
}

/**
 * 表格列
 * @param onActionClick 操作列点击回调
 */
export function useColumns<T = SysLoginLogApi.SysLoginLogDTO>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridColumns {
  return [
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
      title: $t('sys.loginLog.createdAt'),
      width: 200,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'processing',
            label: $t('sys.loginLog.typePasswordLogin'),
            value: LoginLogTypeEnum.PASSWORD_LOGIN,
          },
          {
            color: 'default',
            label: $t('sys.loginLog.typeLogout'),
            value: LoginLogTypeEnum.LOGOUT,
          },
        ],
      },
      field: 'loginLogType',
      title: $t('sys.loginLog.loginLogType'),
      width: 110,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'success',
            label: $t('sys.loginLog.resultSuccess'),
            value: LogResultStatusEnum.SUCCESS,
          },
          {
            color: 'error',
            label: $t('sys.loginLog.resultFailed'),
            value: LogResultStatusEnum.FAILED,
          },
        ],
      },
      field: 'resultStatus',
      title: $t('sys.loginLog.resultStatus'),
      width: 90,
    },
    {
      field: 'userPin',
      title: $t('sys.loginLog.userPin'),
      width: 140,
    },
    {
      field: 'visitorIp',
      title: $t('sys.loginLog.visitorIp'),
      width: 140,
    },
    {
      field: 'visitorIpLocation',
      minWidth: 140,
      title: $t('sys.loginLog.visitorIpLocation'),
    },
    {
      field: 'visitorBrowser',
      minWidth: 140,
      title: $t('sys.loginLog.visitorBrowser'),
    },
    {
      field: 'visitorOs',
      minWidth: 140,
      title: $t('sys.loginLog.visitorOs'),
    },
    {
      field: 'failedMsg',
      minWidth: 200,
      title: $t('sys.loginLog.failedMsg'),
    },
    {
      // 操作列
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'userPin',
          nameTitle: $t('sys.loginLog.userPin'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['detail'],
      },
      field: 'operation',
      fixed: 'right',
      // 关闭溢出 tooltip
      showOverflow: false,
      title: $t('sys.loginLog.action'),
      width: 90,
    },
  ];
}
