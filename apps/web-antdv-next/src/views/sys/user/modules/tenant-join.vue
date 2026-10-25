<script lang="ts" setup>
import type { SelectOptionItem, SysUserApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Empty,
  Input,
  message,
  Radio,
  RadioGroup,
  Spin,
  Tag,
} from 'antdv-next';

import { getRoleSelectOptions, joinTenantUser, lookupTenantUsers } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const loading = ref(false);
const searching = ref(false);

/** 查询条件：账号 / 完整手机号（二选一） */
const pin = ref('');
const phoneNo = ref('');

/** 全局找人结果 */
const results = ref<SysUserApi.TenantUserLookupVO[]>([]);
/** 已发起过查询 */
const searched = ref(false);
/** 选中的用户ID */
const selectedUserId = ref<string>();

/** 可选初始角色 */
const roleOptions = ref<SelectOptionItem[]>([]);
const checkedRoleIds = ref<string[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!selectedUserId.value) {
      message.warning($t('sys.user.lookupSelectFirst'));
      return;
    }
    const target = results.value.find(
      (item) => item.userId === selectedUserId.value,
    );
    if (!target) return;
    drawerApi.lock();
    try {
      await joinTenantUser(target.pin, checkedRoleIds.value);
      message.success($t('ui.actionMessage.operationSuccess'));
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      // 打开先清空，避免网络阻塞时残留上一次数据
      pin.value = '';
      phoneNo.value = '';
      results.value = [];
      searched.value = false;
      selectedUserId.value = undefined;
      checkedRoleIds.value = [];
      loading.value = true;
      try {
        roleOptions.value = (await getRoleSelectOptions()) ?? [];
      } finally {
        loading.value = false;
      }
    }
  },
});

defineExpose({ drawerApi });

/** 全局找人（账号/手机号至少填一项） */
async function onSearch() {
  const trimmedPin = pin.value.trim();
  const trimmedPhone = phoneNo.value.trim();
  if (!trimmedPin && !trimmedPhone) {
    message.warning($t('sys.user.lookupEmptyTip'));
    return;
  }
  searching.value = true;
  try {
    results.value =
      (await lookupTenantUsers({
        phoneNo: trimmedPhone || undefined,
        pin: trimmedPin || undefined,
      })) ?? [];
    searched.value = true;
    selectedUserId.value = undefined;
  } finally {
    searching.value = false;
  }
}
</script>
<template>
  <Drawer :title="$t('sys.user.tenantJoin')" class="w-[560px]">
    <Spin :spinning="loading">
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <Input
            v-model:value="pin"
            allow-clear
            :placeholder="$t('sys.user.pin')"
          />
          <Input
            v-model:value="phoneNo"
            allow-clear
            :placeholder="$t('sys.user.phoneNo')"
            @press-enter="onSearch"
          />
          <Button :loading="searching" type="primary" @click="onSearch">
            {{ $t('sys.user.lookup') }}
          </Button>
        </div>
        <RadioGroup v-model:value="selectedUserId" class="flex flex-col gap-2">
          <Radio
            v-for="item in results"
            :key="item.userId"
            :disabled="item.memberFlag"
            :value="item.userId"
          >
            <span>{{ item.pin }}（{{ item.nickname }}）</span>
            <span class="ml-2 text-gray-400">{{ item.phoneNo }}</span>
            <Tag v-if="item.memberFlag" class="ml-2" color="green">
              {{ $t('sys.user.alreadyMember') }}
            </Tag>
          </Radio>
        </RadioGroup>
        <Empty
          v-if="searched && results.length === 0"
          :description="$t('sys.user.lookupNoResult')"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          class="py-8"
        />
        <div class="flex flex-col gap-2">
          <span class="text-gray-500">
            {{ $t('sys.user.tenantJoinRoleTip') }}
          </span>
          <CheckboxGroup v-model:value="checkedRoleIds" class="flex flex-col gap-2">
            <Checkbox
              v-for="item in roleOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </Checkbox>
          </CheckboxGroup>
        </div>
      </div>
    </Spin>
  </Drawer>
</template>
