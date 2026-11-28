<script lang="ts" setup>
// helium customization: 通用实体选择输入框 —— tags 回显多选结果，点击主体打开选择抽屉；超 3 项折叠
import type { EntityPickerItem } from './use-entity-picker';

import { computed, ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';

import { Tag } from 'antdv-next';

import { $t } from '#/locales';

const props = defineProps<{
  /** 数量单位文案，如 "人" */
  countUnit?: string;
  /** 已选条目 */
  items: EntityPickerItem[];
  /** 空态占位文案 */
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'open'): void;
  (e: 'remove', id: string): void;
}>();

const CloseCircleFilled = createIconifyIcon(
  'ant-design:close-circle-filled',
);
const DownOutlined = createIconifyIcon('ant-design:down-outlined');

/** 超过该数量折叠为 "已选 N ..." */
const COLLAPSE_THRESHOLD = 3;

const expanded = ref(false);
const collapsed = computed(
  () => !expanded.value && props.items.length > COLLAPSE_THRESHOLD,
);
const shownItems = computed(() =>
  collapsed.value ? props.items.slice(0, COLLAPSE_THRESHOLD) : props.items,
);
</script>
<template>
  <div
    class="border-border flex min-h-8 w-full cursor-pointer flex-wrap items-center gap-1 rounded-md border border-solid px-1.5 py-0.5 transition-colors hover:border-primary"
    @click="emit('open')"
  >
    <span v-if="items.length === 0" class="text-muted-foreground px-1 text-sm">
      {{ placeholder ?? $t('entityPicker.placeholder') }}
    </span>
    <!-- 点击 tag 本体/关闭按钮不触发打开抽屉 -->
    <span v-else class="flex flex-wrap items-center gap-1" @click.stop>
      <Tag
        v-for="item in shownItems"
        :key="item.id"
        closable
        @close="emit('remove', item.id)"
      >
        {{ item.label }}
      </Tag>
      <Tag v-if="collapsed" @click="expanded = true">
        {{ $t('entityPicker.selectedCount', [items.length, countUnit ?? '']) }}
      </Tag>
    </span>
    <span
      v-if="items.length > 0"
      class="text-muted-foreground ml-auto shrink-0 cursor-pointer px-1 hover:text-foreground"
      @click.stop="emit('clear')"
    >
      <CloseCircleFilled />
    </span>
    <DownOutlined class="text-muted-foreground ml-1 shrink-0" />
  </div>
</template>
