import { defHttp } from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
import { SysLogApiResult } from './model/SysLogModel';

enum Api {
  REST = '/api/v1/sys/logs',
}

/**
 * 后台操作日志-分页列表
 */
export const listSysLogApi = (queryForm: any, mode: ErrorMessageMode = 'modal') => {
  if (queryForm.timeRangePicker) {
    queryForm['beginAt'] = queryForm.timeRangePicker[0];
    queryForm['endAt'] = queryForm.timeRangePicker[1];
  }

  return defHttp.get<SysLogApiResult[]>(
    {
      url: Api.REST,
      params: queryForm,
    },
    {
      errorMessageMode: mode,
    },
  );
};
