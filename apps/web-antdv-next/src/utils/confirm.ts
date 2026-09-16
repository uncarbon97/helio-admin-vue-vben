// adapt to helium: 居中模态框二次确认（替代操作列 Popconfirm，样式同退出登录确认框）
import { confirm as vbenConfirm } from '@vben/common-ui';

/**
 * 二次确认（确认走 resolve、取消走 reject，此处统一转为布尔）
 * @param message 提示内容
 * @param title 标题，默认「提示」
 * @returns 是否确认
 */
export async function confirmAction(
  message: string,
  title?: string,
): Promise<boolean> {
  try {
    await vbenConfirm(message, title);
    return true;
  } catch {
    return false;
  }
}
