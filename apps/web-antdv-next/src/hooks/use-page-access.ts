import { useAccess } from '@vben/access';

/**
 * 权限码固定搭配后缀，对齐后端 PermPattern
 */
export const PermPattern = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

/**
 * 按页权限码前缀一次算出的按钮权限包：
 * 固定搭配预计算布尔，has() 兜特殊串（bind-menu / kick-out 等）
 */
export function usePageAccess(prefix: string) {
  const { hasAccessByCodes } = useAccess();
  return {
    showCreate: hasAccessByCodes([prefix + PermPattern.CREATE]),
    showUpdate: hasAccessByCodes([prefix + PermPattern.UPDATE]),
    showDelete: hasAccessByCodes([prefix + PermPattern.DELETE]),
    /** 特殊串判断（只传后缀，自动拼页面前缀） */
    has: (code: string) => hasAccessByCodes([prefix + code]),
  };
}

export type PageAccess = ReturnType<typeof usePageAccess>;

/** 全放行兜底：列定义复用场景（如选人抽屉）未传权限包时使用 */
export const FULL_PAGE_ACCESS: PageAccess = {
  showCreate: true,
  showUpdate: true,
  showDelete: true,
  has: () => true,
};
