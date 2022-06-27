import { defHttp } from '/@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';

enum Api {
  // Helio: 修改为取侧边菜单接口地址
  GetMenuList = '/api/v1/sys/menus/side',
}

/**
 * @description: Get user menu based on id
 */

/**
 * Helio: 菜单项 array 转 tree
 * @param items 菜单项 array
 */
function menu2Tree(items: getMenuListResultModel): getMenuListResultModel {
  const data = JSON.parse(JSON.stringify(items)); // 浅拷贝不改变源数据
  const result = [];
  if (!Array.isArray(data)) {
    return result;
  }
  data.forEach((item) => {
    delete item.children;
  });
  const map = {};
  data.forEach((item) => {
    map[item.id] = item;
  });
  data.forEach((item) => {
    const parent = map[item.parentId];
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      // @ts-ignore
      result.push(item);
    }
  });
  return result;
}

// Helio: 修改为 async 异步调用，以便得到菜单列表后直接转为树结构
export const getMenuList = async () => {
  const res = await defHttp.get<getMenuListResultModel>({ url: Api.GetMenuList });
  // Helio: 由前端将列表转为树结构
  return menu2Tree(res);
};
