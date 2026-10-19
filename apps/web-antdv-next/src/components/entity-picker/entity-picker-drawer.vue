<script lang="ts" setup>
// helium customization: 通用实体选择抽屉壳 —— 底部展示已选数量 + 确定/取消，内容经默认插槽注入
import { watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { $t } from '#/locales';

defineOptions({ name: 'EntityPickerDrawer' });

const props = defineProps<{
  /** 数量单位文案，如 "人" */
  countUnit?: string;
  /** 已选数量 */
  count?: number;
  /** 受控打开状态 */
  open?: boolean;
  /** 抽屉标题 */
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'update:open', open: boolean): void;
}>();

const [Drawer, drawerApi] = useVbenDrawer({
  // 选人内容较宽（部门树 + 表格），默认 w-130 太窄
  class: 'w-[70vw] max-w-[1600px] min-w-[720px]',
  // 内容区改为纵向 flex 填满高度，避免底部留白
  contentClass: 'flex flex-col overflow-hidden',
  closeOnClickModal: false,
  footer: true,
  onConfirm() {
    emit('confirm');
    drawerApi.close();
  },
  onOpenChange(isOpen) {
    if (!isOpen) {
      emit('update:open', false);
    }
  },
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      drawerApi.open();
    } else {
      drawerApi.close();
    }
  },
);
</script>
<template>
  <Drawer :title="title">
    <slot></slot>
    <template #prepend-footer>
      <span class="text-muted-foreground mr-auto text-sm">
        {{
          $t('entityPicker.selectedCount', [count ?? 0, countUnit ?? ''])
        }}
      </span>
    </template>
  </Drawer>
</template>
