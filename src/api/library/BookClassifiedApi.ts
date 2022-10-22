import { defHttp } from '/@/utils/http/axios';
import {
  BookClassifiedApiResult,
  BookClassifiedInsertOrUpdateForm,
} from './model/BookClassifiedModel';

enum Api {
  REST = '/api/v1/library/bookClassifieds',
  OPTIONS = '/api/v1/library/bookClassifieds/options',
}

/**
 * 书籍类别-列表
 */
export const listBookClassifiedApi = () => {
  return defHttp.get<BookClassifiedApiResult[]>({
    url: Api.REST,
    // 不需要参数
  });
};

/**
 * 书籍类别-详情
 */
export const retrieveBookClassifiedApi = (id: string) => {
  return defHttp.get<BookClassifiedApiResult>({
    url: Api.REST + '/' + id,
  });
};

/**
 * 书籍类别-新增
 */
export const createBookClassifiedApi = (insertForm: BookClassifiedInsertOrUpdateForm) => {
  return defHttp.post<void>({
    url: Api.REST,
    params: insertForm,
  });
};

/**
 * 书籍类别-编辑
 */
export const updateBookClassifiedApi = (
  id: string,
  updateForm: BookClassifiedInsertOrUpdateForm,
) => {
  return defHttp.put<void>({
    url: Api.REST + '/' + id,
    params: updateForm,
  });
};

/**
 * 书籍类别-删除
 */
export const deleteBookClassifiedApi = (ids: string[]) => {
  return defHttp.delete<void>({
    url: Api.REST,
    params: {
      ids: ids,
    },
  });
};

/**
 * 书籍类别-列表-下拉框专用
 */
export const listBookClassifiedOptionApi = () => {
  return defHttp.get<BookClassifiedApiResult[]>({
    url: Api.OPTIONS,
  });
};
