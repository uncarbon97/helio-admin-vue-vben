<script setup lang="ts">
import { ref, unref } from 'vue';

import { createIconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useTimezoneStore } from '@vben/stores';

import { useVbenModal } from '@vben-core/popup-ui';
import {
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  VbenIconButton,
} from '@vben-core/shadcn-ui';

withDefaults(defineProps<{ showButton?: boolean }>(), { showButton: true });

const TimezoneIcon = createIconifyIcon('fluent-mdl2:world-clock');

const timezoneStore = useTimezoneStore();

const timezoneRef = ref<string | undefined>();

const timezoneOptionsRef = ref<
  {
    label: string;
    value: string;
  }[]
>([]);

// helium customization: 弹窗打开时的快照，确认时据此判断时区/偏移开关是否变化，变化则刷新页面
let initialShowOffset = 0;
let initialTimezone: string | undefined;

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: async () => {
    try {
      modalApi.setState({ confirmLoading: true });
      const timezone = unref(timezoneRef);
      const timezoneChanged = !!timezone && timezone !== initialTimezone;
      if (timezoneChanged) {
        await timezoneStore.setTimezone(timezone);
      }
      modalApi.close();
      // helium customization: 时区或偏移开关变化后刷新页面
      if (
        timezoneChanged ||
        timezoneStore.showTimezoneOffset !== initialShowOffset
      ) {
        location.reload();
      }
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      initialTimezone = unref(timezoneStore.timezone);
      initialShowOffset = timezoneStore.showTimezoneOffset;
      timezoneRef.value = initialTimezone;
      timezoneOptionsRef.value = await timezoneStore.getTimezoneOptions();
    }
  },
});

function open() {
  modalApi.open();
}

defineExpose({ open });
</script>

<template>
  <div>
    <VbenIconButton
      v-if="showButton"
      :tooltip="$t('ui.widgets.timezone.setTimezone')"
      class="hover:animate-[shrink_0.3s_ease-in-out]"
      @click="open"
    >
      <TimezoneIcon class="size-4 text-foreground" />
    </VbenIconButton>
    <Modal :title="$t('ui.widgets.timezone.setTimezone')">
      <div class="timezone-container">
        <RadioGroup v-model="timezoneRef" class="flex flex-col gap-2">
          <div
            class="flex cursor-pointer items-center gap-2"
            v-for="item in timezoneOptionsRef"
            :key="`container${item.value}`"
          >
            <RadioGroupItem :id="item.value" :value="item.value" />
            <label :for="item.value" class="cursor-pointer">{{
              item.label
            }}</label>
          </div>
        </RadioGroup>
      </div>
      <!-- helium customization: 底栏左下角持久化选项，是否展示时刻字符串的时区偏移后缀（复用 YesOrNoEnum 取值） -->
      <template #prepend-footer>
        <div class="mr-auto flex items-center gap-2 pl-2">
          <Checkbox
            id="showTimezoneOffset"
            :model-value="timezoneStore.showTimezoneOffset === 1"
            @update:model-value="
              (checked) =>
                timezoneStore.setShowTimezoneOffset(checked === true ? 1 : 0)
            "
          />
          <label for="showTimezoneOffset" class="cursor-pointer">{{
            $t('ui.widgets.timezone.showOffset')
          }}</label>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.timezone-container {
  @apply pl-5;
}
</style>
