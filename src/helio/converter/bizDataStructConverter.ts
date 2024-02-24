/*
Helio: 业务数据结构转换
 */

/**
 * 后端 list 转 tree
 * 从 treeHelper 的 listToTree 魔改来的
 * @param list list
 * @param aliasNameAsTitle 转换结果会多一个title字段，作为name的别名，默认为true
 */
export function list2Tree(list: any[], aliasNameAsTitle: boolean = true): any[] {
  const nodeMap = new Map();
  const result: any[] = [];

  for (const node of list) {
    if (aliasNameAsTitle && node.name && !node.title) {
      node.title = node.name;
    }
    nodeMap.set(node.id, node);
  }
  for (const node of list) {
    const parent = nodeMap.get(node.parentId);
    (parent ? parent.children || (parent.children = []) : result).push(node);
  }
  return result;
}
