import { defHttp } from '/@/utils/http/axios';
import { BookApiResult, BookInsertOrUpdateForm } from './model/BookModel';

enum Api {
  REST = '/api/v1/library/books',
  OPTIONS = '/api/v1/library/books/options',
}

/**
 * 书籍-分页列表
 */
export const listBookApi = (queryForm: any) => {
  return defHttp.get<BookApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 书籍-详情
 */
export const retrieveBookApi = (id: string) => {
  return defHttp.get<BookApiResult>({
    url: Api.REST + '/' + id,
  });
};

/**
 * 书籍-新增
 */
export const createBookApi = (insertForm: BookInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 书籍-编辑
 */
export const updateBookApi = (id: string, updateForm: BookInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: Api.REST + '/' + id,
    params: updateForm,
  });
};

/**
 * 书籍-删除
 */
export const deleteBookApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 书籍-列表-下拉框专用
 */
export const listBookOptionApi = () => {
  return defHttp.get<BookApiResult[]>({
    url: Api.OPTIONS,
  });
};
