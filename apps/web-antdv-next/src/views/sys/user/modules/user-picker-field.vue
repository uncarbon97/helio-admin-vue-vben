<script lang="ts" setup>
import type { EntityPickerItem } from '#/components/entity-picker';

import { ref } from 'vue';

import { EntityPickerInput } from '#/components/entity-picker';
import { $t } from '#/locales';

import UserSelectDrawer from './user-select-drawer.vue';

defineOptions({ name: 'UserPickerField' });

const props = defineProps<{
  /** 已选项（表单 v-model:modelValue） */
  modelValue?: EntityPickerItem[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: EntityPickerItem[]): void;
}>();

const open = ref(false);

function onConfirm(items: EntityPickerItem[]) {
  emit('update:modelValue', items);
}
</script>
<template>
  <EntityPickerInput
    :count-unit="$t('sys.user.countUnit')"
    :items="props.modelValue ?? []"
    @clear="emit('update:modelValue', [])"
    @open="open = true"
    @remove="
      emit(
        'update:modelValue',
        (props.modelValue ?? []).filter((item) => item.id !== $event),
      )
    "
  />
  <UserSelectDrawer
    v-model:open="open"
    :selected="props.modelValue ?? []"
    @confirm="onConfirm"
  />
</template>
