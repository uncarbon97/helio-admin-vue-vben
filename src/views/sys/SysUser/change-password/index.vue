<template>
  <PageWrapper title="修改当前用户密码" content="修改成功后会自动退出当前登录！">
    <div class="py-8 bg-white flex flex-col justify-center items-center">
      <BasicForm @register="register" />
      <div class="flex justify-center">
        <a-button @click="resetFields"> 重置</a-button>
        <a-button class="!ml-4" type="primary" @click="handleSubmit"> 确认</a-button>
      </div>
    </div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { PageWrapper } from '@/components/Page';
  import { BasicForm, useForm } from '@/components/Form';

  import { formSchema } from './pwd.data';
  import { updateCurrentSysUserPasswordApi } from '@/api/sys/SysUserApi';
  import { useMessage } from '@/hooks/web/useMessage';

  const { createMessage } = useMessage();

  const [register, { validate, resetFields }] = useForm({
    size: 'large',
    baseColProps: { span: 24 },
    labelWidth: 100,
    showActionButtonGroup: false,
    schemas: formSchema,
  });

  async function handleSubmit() {
    const values = await validate();
    const { oldPassword, newPassword, confirmNewPassword } = values;

    await updateCurrentSysUserPasswordApi({
      oldPassword,
      newPassword,
      confirmNewPassword,
    });

    createMessage.success('修改成功, 请重新登录');
  }
</script>
