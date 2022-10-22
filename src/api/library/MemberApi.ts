import { defHttp } from '/@/utils/http/axios';
import { MemberApiResult, MemberInsertOrUpdateForm } from './model/MemberModel';

enum Api {
  REST = '/api/v1/library/members',
  OPTIONS = '/api/v1/library/members/options',
}

/**
 * 会员-分页列表
 */
export const listMemberApi = (queryForm: any) => {
  return defHttp.get<MemberApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 会员-详情
 */
export const retrieveMemberApi = (id: string) => {
  return defHttp.get<MemberApiResult>({
    url: Api.REST + '/' + id,
  });
};

/**
 * 会员-新增
 */
export const createMemberApi = (insertForm: MemberInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 会员-编辑
 */
export const updateMemberApi = (id: string, updateForm: MemberInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: Api.REST + '/' + id,
    params: updateForm,
  });
};

/**
 * 会员-删除
 */
export const deleteMemberApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 会员-列表-下拉框专用
 */
export const listMemberOptionApi = () => {
  return defHttp.get<MemberApiResult[]>({
    url: Api.OPTIONS,
  });
};
