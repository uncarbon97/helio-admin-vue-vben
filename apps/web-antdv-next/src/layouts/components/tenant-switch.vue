<script lang="ts" setup>
import type { TenantSwitchApi } from '#/api';

import { computed, onMounted, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { useAccessStore } from '@vben/stores';

import { Button, Empty, Input, Tag } from 'antdv-next';

import { useTenantStore } from '#/store';

defineOptions({ name: 'TenantSwitch' });

const TenantSwitchIcon = createIconifyIcon('ant-design:swap-outlined');
const accessStore = useAccessStore();
const tenantStore = useTenantStore();

/** 搜索关键字（按名称/编码过滤） */
const keyword = ref('');
/** 已选中的目标租户编码 */
const selectedCode = ref<string | undefined>();
/** 切换/退出切换请求进行中 */
const switching = ref(false);

// 当前视角展示名：平台视角或无租户名称时显示“切换租户”
const currentLabel = computed(() => {
  const context = tenantStore.current;
  if (!context || context.firstPartyView || !context.tenantName) {
    return $t('tenant.switch.switchTenant');
  }
  return context.tenantName;
});

const displayTenants = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  const list = tenantStore.switchable;
  if (!kw) {
    return list;
  }
  return list.filter(
    (item) =>
      item.tenantName.toLowerCase().includes(kw) ||
      item.tenantCode.toLowerCase().includes(kw),
  );
});

function selectTenant(tenant: TenantSwitchApi.SwitchableTenant) {
  // 当前租户不可选为目标
  if (tenant.tenantCode === tenantStore.current?.tenantCode) {
    return;
  }
  selectedCode.value = tenant.tenantCode;
}

const [Modal, modalApi] = useVbenModal({
  centered: true,
  fullscreenButton: false,
  async onConfirm() {
    if (!selectedCode.value || switching.value) {
      return;
    }
    switching.value = true;
    modalApi.setState({ confirmLoading: true });
    try {
      await tenantStore.switchTo(selectedCode.value);
      modalApi.close();
    } finally {
      switching.value = false;
      modalApi.setState({ confirmLoading: false });
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      // 打开时先清空选择与搜索，避免残留上次状态
      selectedCode.value = undefined;
      keyword.value = '';
      await tenantStore.init();
    }
  },
});

async function handleExitSwitch() {
  if (switching.value) {
    return;
  }
  switching.value = true;
  try {
    await tenantStore.exitSwitch();
    modalApi.close();
  } finally {
    switching.value = false;
  }
}

onMounted(() => {
  tenantStore.init();
});

// 令牌变化（如登录过期后重登）时重置并重拉租户上下文，避免残留其他账号的视角
watch(
  () => accessStore.accessToken,
  () => {
    tenantStore.$reset();
    tenantStore.init();
  },
);
</script>

<template>
  <div>
    <div
      v-if="tenantStore.switchable.length > 0"
      class="flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 text-sm transition-colors hover:bg-accent"
      @click="modalApi.open()"
    >
      <TenantSwitchIcon class="size-4" />
      <span class="max-w-40 truncate">{{ currentLabel }}</span>
      <Tag v-if="tenantStore.current?.switched" class="mr-0" color="orange">
        {{ $t('tenant.switch.switched') }}
      </Tag>
    </div>
    <Modal :title="$t('tenant.switch.title')" class="w-[560px]">
      <!-- 当前视角说明 -->
      <div class="mb-3 flex items-center gap-2 text-sm">
        <span class="text-muted-foreground">
          {{ $t('tenant.switch.currentView') }}
        </span>
        <span class="font-medium">{{ currentLabel }}</span>
        <Tag v-if="tenantStore.current?.switched" color="orange">
          {{ $t('tenant.switch.switched') }}
        </Tag>
      </div>
      <Input
        v-model:value="keyword"
        allow-clear
        :placeholder="$t('tenant.switch.searchPlaceholder')"
      />
      <!-- 租户列表（模态框内选择，而非下拉框） -->
      <div class="mt-3 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
        <div
          v-for="tenant in displayTenants"
          :key="tenant.tenantId"
          class="border-border flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 transition-colors"
          :class="
            tenant.tenantCode === tenantStore.current?.tenantCode
              ? 'bg-primary/5 border-primary/60'
              : selectedCode === tenant.tenantCode
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-accent'
          "
          @click="selectTenant(tenant)"
        >
          <div class="min-w-0">
            <div class="truncate text-sm font-medium">
              {{ tenant.tenantName }}
            </div>
            <div class="text-muted-foreground truncate text-xs">
              {{ tenant.tenantCode }}
            </div>
          </div>
          <Tag v-if="tenant.tenantCode === tenantStore.current?.tenantCode">
            {{ $t('tenant.switch.currentTag') }}
          </Tag>
        </div>
        <Empty
          v-if="displayTenants.length === 0"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        />
      </div>
      <!-- 处于切换态时，左下角提供退出切换 -->
      <template #prepend-footer>
        <div class="mr-auto pl-2">
          <Button
            v-if="tenantStore.current?.switched"
            :loading="switching"
            danger
            @click="handleExitSwitch"
          >
            {{ $t('tenant.switch.exit') }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
