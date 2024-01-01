import { BasicColumn, FormSchema } from '@/components/Table';
import { DescItem } from '@/components/Description';
import { Ref, ref } from 'vue';
import { TreeItem } from '@/components/Tree';
import { listAllMenuApi } from '@/api/sys/SysMenuApi';
import { menu2Tree } from '@/api/sys/menu';
import { RouteItem } from '@/api/sys/model/menuModel';

/**
 * 表格列
 */
export const columns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'title',
    width: 80,
  },
  {
    title: '值',
    dataIndex: 'value',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 80,
  },
];

/**
 * 查询条件
 */
export const queryFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: '名称',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'value',
    label: '值',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
];

/**
 * 查看详情表单
 */
export const retrieveDetailFormSchema: DescItem[] = [
  {
    field: 'title',
    label: '名称',
  },
  {
    field: 'value',
    label: '值',
  },
  {
    field: 'createdAt',
    label: '创建时间',
  },
  {
    field: 'updatedAt',
    label: '更新时间',
  },
];

/**
 * 新增/编辑表单
 */
export const insertOrUpdateFormSchema: FormSchema[] = [
  {
    field: 'id',
    label: '主键ID(只是为了带过来)',
    component: 'Render',
    show: false,
  },
  {
    field: 'title',
    label: '名称',
    required: true,
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'value',
    label: '值',
    required: true,
    component: 'Input',
    componentProps: {},
  },
];

/*
预加载：菜单树状数据
 */
const menuTreeData = ref<TreeItem[]>([]);
const hasChildMenuMap = ref<Map<string, boolean>>(new Map<string, boolean>());
export function refreshMenuTreeData() {
  listAllMenuApi().then((apiResult: RouteItem[]) => {
    // @ts-ignore
    menuTreeData.value = menu2Tree(apiResult) as TreeItem[];

    const newHasChildMenuMap = new Map<string, boolean>();
    apiResult.forEach((item) => {
      newHasChildMenuMap.set(item.parentId, true);
    });
    hasChildMenuMap.value = newHasChildMenuMap;
  });
}
export function getMenuTreeData(): Ref<TreeItem[]> {
  return menuTreeData;
}
export function getHasChildMenuMap(): Ref<Map<string, boolean>> {
  return hasChildMenuMap;
}
