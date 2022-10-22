import { defHttp } from '/@/utils/http/axios';
import { BookDamageApiResult, BookDamageInsertOrUpdateForm } from './model/BookDamageModel';

enum Api {
  REST = '/api/v1/library/bookDamages',
}

/**
 * 书籍损坏记录-分页列表
 */
export const listBookDamageApi = (queryForm: any) => {
  return defHttp.get<BookDamageApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 书籍损坏记录-详情
 */
export const retrieveBookDamageApi = (id: string) => {
  return defHttp.get<BookDamageApiResult>({
    url: Api.REST + '/' + id,
  });
};

/**
 * 书籍损坏记录-新增
 */
export const createBookDamageApi = (insertForm: BookDamageInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 书籍损坏记录-编辑
 */
export const updateBookDamageApi = (id: string, updateForm: BookDamageInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: Api.REST + '/' + id,
    params: updateForm,
  });
};

/**
 * 书籍损坏记录-删除
 */
export const deleteBookDamageApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};
