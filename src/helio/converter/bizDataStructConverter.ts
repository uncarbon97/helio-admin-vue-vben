/*
Helio: 业务数据结构转换
 */

/**
 * 后端 list 转 tree
 * 从 treeHelper 的 listToTree 魔改来的
 * @param list list
 */
export function list2Tree(list: any[]): any[] {
  const nodeMap = new Map();
  const result: any[] = [];

  for (const node of list) {
    nodeMap.set(node.id, node);
  }
  for (const node of list) {
    const parent = nodeMap.get(node.parentId);
    (parent ? parent.children || (parent.children = []) : result).push(node);
  }
  return result;
}
