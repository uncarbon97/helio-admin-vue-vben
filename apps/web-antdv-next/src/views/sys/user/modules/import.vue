<script lang="ts" setup>
import type { UploadFile } from 'antdv-next';

import type { DeptOptionNode, SelectOptionItem, SysUserApi } from '#/api';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  InputPassword,
  message,
  Spin,
  Switch,
  TreeSelect,
  Upload,
} from 'antdv-next';

import {
  buildDeptOptionTree,
  downloadUserImportTemplate,
  getDeptSelectOptions,
  getRoleSelectOptions,
  importUsers,
} from '#/api';
import { $t } from '#/locales';

import {
  SUPER_ADMIN_ROLE_CODE,
  TENANT_ADMIN_ROLE_CODE,
} from '#/constants/role';

const emits = defineEmits(['success']);

/** 待导入文件（单份） */
const fileList = ref<UploadFile[]>([]);
/** 统一初始密码（5-20位） */
const initPwd = ref('');
/** 导入后是否直接启用账号 */
const autoEnable = ref(true);
/** 统一绑定角色 */
const roleOptions = ref<SelectOptionItem[]>([]);
const checkedRoleIds = ref<string[]>([]);
/** 统一所属部门 */
const deptOptions = ref<DeptOptionNode[]>([]);
const selectedDeptId = ref<string>();
const loading = ref(false);
const templateLoading = ref(false);
/** 导入结果；非空时切换为结果面板 */
const result = ref<null | SysUserApi.SysUserImportResult>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    // 结果面板：确认即关闭
    if (result.value) {
      drawerApi.close();
      return;
    }
    const file = fileList.value[0]?.originFileObj;
    if (!file) {
      message.warning($t('sys.user.importNeedFile'));
      return;
    }
    if (initPwd.value.length < 5 || initPwd.value.length > 20) {
      message.warning($t('sys.user.initPwdTip'));
      return;
    }
    drawerApi.lock();
    try {
      result.value = await importUsers(file, {
        autoEnable: autoEnable.value,
        defaultDeptId: selectedDeptId.value || undefined,
        defaultRoleIds: checkedRoleIds.value.length > 0
          ? checkedRoleIds.value
          : undefined,
        initPwd: initPwd.value,
      });
      drawerApi.unlock();
      // 有成功行则刷新列表
      if ((result.value?.successCount ?? 0) > 0) {
        emits('success');
      }
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      fileList.value = [];
      initPwd.value = '';
      autoEnable.value = true;
      checkedRoleIds.value = [];
      selectedDeptId.value = undefined;
      result.value = null;
      loading.value = true;
      try {
        const [roles, depts] = await Promise.all([
          getRoleSelectOptions(),
          getDeptSelectOptions(),
        ]);
        roleOptions.value = (roles ?? []).filter(
          // 过滤内置角色，不可通过导入批量绑定
          (item) =>
            item.roleCode !== SUPER_ADMIN_ROLE_CODE &&
            item.roleCode !== TENANT_ADMIN_ROLE_CODE,
        );
        deptOptions.value = buildDeptOptionTree(depts);
      } finally {
        loading.value = false;
      }
    }
  },
});

defineExpose({ drawerApi });

/** 下载导入模板 */
async function onDownloadTemplate() {
  templateLoading.value = true;
  try {
    await downloadUserImportTemplate();
  } catch {
    // 错误提示由全局拦截器统一处理
  } finally {
    templateLoading.value = false;
  }
}
</script>
<template>
  <Drawer :title="$t('sys.user.importTitle')" class="w-[560px]">
    <!-- 导入表单 -->
    <Spin v-if="!result" :spinning="loading">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <div class="w-28 shrink-0 text-right">
            {{ $t('sys.user.importTemplate') }}
          </div>
          <Button :loading="templateLoading" @click="onDownloadTemplate">
            <IconifyIcon
              class="size-4"
              icon="ant-design:download-outlined"
            />
            {{ $t('sys.user.importDownloadTemplate') }}
          </Button>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-28 shrink-0 text-right">
            {{ $t('sys.user.importFile') }}
          </div>
          <div class="min-w-0 flex-1">
            <Upload
              v-model:file-list="fileList"
              :before-upload="() => false"
              :max-count="1"
              accept=".xlsx"
            >
              <Button :disabled="fileList.length > 0">
                <IconifyIcon
                  class="size-4"
                  icon="ant-design:file-excel-outlined"
                />
                {{ $t('sys.user.importChooseFile') }}
              </Button>
            </Upload>
            <div class="mt-1 text-gray-400 text-xs">
              {{ $t('sys.user.importFileTip') }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-28 shrink-0 text-right">
            {{ $t('sys.user.initPwd') }}
          </div>
          <InputPassword
            v-model:value="initPwd"
            :placeholder="$t('sys.user.initPwdTip')"
            class="flex-1"
          />
        </div>

        <div class="flex items-center gap-3">
          <div class="w-28 shrink-0 text-right">
            {{ $t('sys.user.importAutoEnable') }}
          </div>
          <Switch v-model:checked="autoEnable" />
        </div>

        <div class="flex items-center gap-3">
          <div class="w-28 shrink-0 text-right">
            {{ $t('sys.user.deptName') }}
          </div>
          <TreeSelect
            v-model:value="selectedDeptId"
            :field-names="{ children: 'children', label: 'name', value: 'id' }"
            :placeholder="$t('sys.user.deptName')"
            :tree-data="deptOptions"
            allow-clear
            class="flex-1"
            tree-default-expand-all
          />
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-gray-500">
            {{ $t('sys.user.importRoleTip') }}
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

    <!-- 导入结果面板 -->
    <div v-else class="flex flex-col gap-3">
      <Alert
        :message="
          $t('sys.user.importResultSummary', [
            result.totalRows,
            result.successCount,
            result.failedCount,
          ])
        "
        :type="result.failedCount > 0 ? 'error' : 'success'"
        show-icon
      />
      <template v-if="result.errors?.length">
        <div class="flex flex-col gap-2">
          <div
            v-for="item in result.errors"
            :key="`${item.rowNumber}-${item.pin}`"
            class="rounded bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800"
          >
            <span class="mr-2 text-gray-500">
              {{ $t('sys.user.importRowNo', [item.rowNumber]) }}
            </span>
            <span v-if="item.pin" class="mr-2">{{ item.pin }}</span>
            <span class="text-destructive">{{ item.reason }}</span>
          </div>
        </div>
        <div v-if="result.errorTruncated" class="text-gray-400 text-xs">
          {{ $t('sys.user.importErrorTruncated') }}
        </div>
      </template>
    </div>
  </Drawer>
</template>
