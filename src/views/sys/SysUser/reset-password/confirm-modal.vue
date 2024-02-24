<template>
  <BasicModal
    v-bind="$attrs"
    :min-height="100"
    title="重置密码确认"
    destroyOnClose
    @register="register"
    @ok="handleOk"
  >
    <Alert :message="`是否确认为【${username}】重置密码？`" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { Alert, notification } from 'ant-design-vue';
  import { resetSysUserPasswordApi } from '@/api/sys/SysUserApi';

  const username = ref<string>(),
    userId = ref<string>();
  const [register, { closeModal }] = useModalInner((data) => {
    // 接收列表页透传的参数
    username.value = data.record.username;
    userId.value = data.record.id;
  });

  function randomString(length) {
    length = length || 32;
    const str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678',
      a = str.length;
    let ret = '';
    for (let i = 0; i < length; i++) {
      ret += str.charAt(Math.floor(Math.random() * a));
    }

    return ret;
  }

  async function handleOk() {
    if (userId.value == null) {
      notification.error({
        message: '重置失败',
        description: '选中用户ID无效',
        duration: 3,
      });
      return;
    }

    const randomPassword = randomString(20);

    await resetSysUserPasswordApi(userId.value, randomPassword);

    notification.success({
      message: '重置成功',
      description: '新密码：' + randomPassword,
      duration: 10,
    });
    closeModal();
  }
</script>
