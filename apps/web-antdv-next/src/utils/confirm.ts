// adapt to helium: 居中模态框二次确认，替代操作列 PopConfirm
import { h } from 'vue';

import { confirm as vbenConfirm } from '@vben/common-ui';

export interface ConfirmActionOptions {
  /** 红色小字警示（逐条展示在提示内容下方） */
  dangerTips?: string[];
  /** 标题，默认「提示」 */
  title?: string;
}

/**
 * 二次确认（确认走 resolve、取消走 reject，此处统一转为布尔）
 * @param message 提示内容
 * @param options 可选项：标题、红色警示文案
 * @returns 是否确认
 */
export async function confirmAction(
  message: string,
  options: ConfirmActionOptions = {},
): Promise<boolean> {
  const { dangerTips, title } = options;
  const content = dangerTips?.length
    ? h('div', [
        h('p', message),
        ...dangerTips.map((tip) =>
          h('p', { class: 'mt-1 text-destructive text-xs' }, tip),
        ),
      ])
    : message;
  try {
    await vbenConfirm({ content, title });
    return true;
  } catch {
    return false;
  }
}
