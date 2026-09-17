<script lang="ts" setup>
import type { SelectOptionItem, SysUserApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Checkbox, CheckboxGroup, Empty, Spin } from 'antdv-next';

import { bindUserRole, getRoleSelectOptions, listRelatedRole } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const loading = ref(false);
const userId = ref<string>();
const userNickname = ref('');

/** 全部角色选项 */
const roleOptions = ref<SelectOptionItem[]>([]);
/** 已勾选角色ID */
const checkedRoleIds = ref<string[]>([]);

const [Drawer, drawerApi] = useVbenDrawer<null | SysUserApi.SysUserDTO>({
  async onConfirm() {
    if (!userId.value) return;
    drawerApi.lock();
    try {
      // 空数组 = 解除所有绑定
      await bindUserRole(userId.value, checkedRoleIds.value);
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      userId.value = data?.id;
      userNickname.value = data?.nickname ?? '';
      loading.value = true;
      try {
        const [options, relatedIds] = await Promise.all([
          getRoleSelectOptions(),
          data?.id ? listRelatedRole(data.id) : Promise.resolve([]),
        ]);
        roleOptions.value = options ?? [];
        checkedRoleIds.value = relatedIds ?? [];
      } finally {
        loading.value = false;
      }
    }
  },
});

defineExpose({ drawerApi });

const getTitle = computed(() =>
  $t('sys.user.bindRoleTitle', [userNickname.value]),
);
</script>
<template>
  <Drawer :title="getTitle" class="w-[560px]">
    <Spin :spinning="loading">
      <CheckboxGroup v-model:value="checkedRoleIds" class="flex flex-col gap-2">
        <Checkbox
          v-for="item in roleOptions"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </Checkbox>
      </CheckboxGroup>
      <Empty
        v-if="roleOptions.length === 0"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        class="py-8"
      />
    </Spin>
  </Drawer>
</template>
