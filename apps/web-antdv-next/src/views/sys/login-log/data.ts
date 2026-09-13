// adapt to helium: 登录日志表格/查询条件配置
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SysLoginLogApi } from '#/api';

import { LogResultStatusEnum, LoginLogTypeEnum } from '#/api';
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
 * @returns
 */
export function useColumns<T = SysLoginLogApi.SysLoginLogDTO>(): VxeTableGridColumns {
  return [
    {
      field: 'createdAt',
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
  ];
}
