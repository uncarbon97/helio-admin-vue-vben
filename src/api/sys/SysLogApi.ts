import { defHttp } from '@/utils/http/axios';
import { SysLogApiResult } from './model/SysLogModel';

enum Api {
  REST = '/api/v1/sys/logs',
}

/**
 * 后台操作日志-分页列表
 */
export const listSysLogApi = (queryForm: any) => {
  // 选择的是日期，补全时分秒部分
  if (queryForm.beginAt) {
    queryForm.beginAt += ' 00:00:00';
  }

  if (queryForm.endAt) {
    queryForm.endAt += ' 23:59:59';
  }

  return defHttp.get<SysLogApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};
