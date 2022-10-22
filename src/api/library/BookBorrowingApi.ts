import { defHttp } from '/@/utils/http/axios';
import {
  BookBorrowingApiResult,
  BookBorrowingInsertOrUpdateForm,
} from './model/BookBorrowingModel';

enum Api {
  REST = '/api/v1/library/bookBorrowings',
}

/**
 * 书籍借阅记录-分页列表
 */
export const listBookBorrowingApi = (queryForm: any) => {
  // 选择的是日期，补全时分秒部分
  if (queryForm.beginAt) {
    queryForm.beginAt += ' 00:00:00';
  }

  if (queryForm.endAt) {
    queryForm.endAt += ' 23:59:59';
  }

  return defHttp.get<BookBorrowingApiResult[]>({
    url: Api.REST,
    params: queryForm,
  });
};

/**
 * 书籍借阅记录-详情
 */
export const retrieveBookBorrowingApi = (id: string) => {
  return defHttp.get<BookBorrowingApiResult>({
    url: Api.REST + '/' + id,
  });
};

/**
 * 书籍借阅记录-新增
 */
export const createBookBorrowingApi = (insertForm: BookBorrowingInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 书籍借阅记录-编辑
 */
export const updateBookBorrowingApi = (id: string, updateForm: BookBorrowingInsertOrUpdateForm) => {
  return defHttp.put<void>({
    url: Api.REST + '/' + id,
    params: updateForm,
  });
};

/**
 * 书籍借阅记录-删除
 */
export const deleteBookBorrowingApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 书籍借阅记录-确认归还
 */
export const returnBookBorrowingApi = (id: string) => {
  return defHttp.post<void>({
    url: Api.REST + '/' + id + '/return',
  });
};
