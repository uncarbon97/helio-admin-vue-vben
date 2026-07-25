<script lang="ts" setup>
import { Page, WorkbenchHeader } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { $t } from '#/locales';

const userStore = useUserStore();
const avatar = userStore.userInfo?.avatar || preferences.app.defaultAvatar;
const realName = userStore.userInfo?.realName;
</script>

<template>
  <Page>
    <div class="mx-auto w-full max-w-2xl">
      <WorkbenchHeader :avatar="avatar">
        <template #title>
          {{ $t('page.dashboard.workbench.greeting', { name: realName }) }}
        </template>
        <template #description>
          {{ $t('page.dashboard.workbench.welcome') }}
        </template>
      </WorkbenchHeader>

      <div class="mt-6 rounded-lg border border-border bg-card p-8 text-center">
        <p class="text-foreground">
          {{ $t('page.dashboard.workbench.hint') }}
        </p>
      </div>

      <p class="mt-4 text-center text-xs text-muted-foreground">
        {{ $t('page.dashboard.workbench.version') }}
      </p>
    </div>
  </Page>
</template>
