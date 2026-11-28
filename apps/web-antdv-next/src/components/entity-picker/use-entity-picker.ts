// helium customization: 通用实体多选 hook —— 管理已选条目（id + 回显文案），供"选人抽屉"等 UX 复用
import { ref } from 'vue';

/** 已选条目：主键 + 回显文案 */
export interface EntityPickerItem {
  id: string;
  label: string;
}

/**
 * 实体选择器状态管理
 *
 * 已选以 id 去重，跨页/筛选保持；
 * 抽屉打开时调用 reset() 传入外部已选，避免残留上次状态。
 *
 * @param options.label 由实体行生成回显文案，如 `${nickname}(${pin})`
 */
export function useEntityPicker<T extends { id: string }>(options: {
  label: (row: T) => string;
}) {
  const items = ref<EntityPickerItem[]>([]);

  /** 重置为指定已选 */
  function reset(preselected: EntityPickerItem[] = []) {
    items.value = [...preselected];
  }

  /** 勾选/取消勾选单行 */
  function toggleRow(row: T, checked: boolean) {
    const index = items.value.findIndex((item) => item.id === row.id);
    if (checked && index === -1) {
      items.value.push({ id: row.id, label: options.label(row) });
    } else if (!checked && index !== -1) {
      items.value.splice(index, 1);
    }
  }

  /** 移除单个已选 */
  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  /** 清空已选 */
  function clear() {
    items.value = [];
  }

  /** 返回已选副本 */
  function getItems(): EntityPickerItem[] {
    return [...items.value];
  }

  return { clear, getItems, items, remove, reset, toggleRow };
}
