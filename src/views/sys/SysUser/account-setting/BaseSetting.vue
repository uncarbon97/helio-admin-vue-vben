<template>
  <Loading :loading="loadingFlag" />
  <CollapseContainer title="基本设置" :canExpand="false">
    <Row :gutter="24">
      <Col :span="14">
        <BasicForm @register="register" ref="formRef" />
      </Col>
      <Col :span="10" v-if="false">
        <div class="change-avatar">
          <div class="mb-2">头像</div>
          <CropperAvatar
            :uploadApi="uploadAvatarApi as any"
            :value="avatar"
            btnText="更换头像"
            :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
            @change="updateAvatar"
            width="150"
          />
        </div>
      </Col>
    </Row>
    <a-button :disabled="loadingFlag" type="primary" @click="handleSubmit"> 更新基本信息 </a-button>
  </CollapseContainer>
</template>
<script lang="ts" setup>
  import { CollapseContainer } from '@/components/Container';
  import { CropperAvatar } from '@/components/Cropper';
  import { BasicForm, useForm } from '@/components/Form';
  import { Col, Row } from 'ant-design-vue';
  import { computed, onMounted, ref } from 'vue';

  import { useMessage } from '@/hooks/web/useMessage';

  import headerImg from '@/assets/images/header.jpg';
  import { useUserStore } from '@/store/modules/user';
  import { baseSetschemas } from './data';
  import { getUserInfo, updateMyInfoApi, uploadAvatarApi } from "@/api/sys/user";
  import { Loading } from "@/components/Loading";

  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const loadingFlag = ref(true);

  const [register, { setFieldsValue, validate }] = useForm({
    labelWidth: 120,
    schemas: baseSetschemas,
    showActionButtonGroup: false,
  });

  onMounted(async () => {
    loadingFlag.value = true;
    const data = await getUserInfo();
    await setFieldsValue(data);
    loadingFlag.value = false;
  });

  const avatar = computed(() => {
    const { avatar } = userStore.getUserInfo;
    return avatar || headerImg;
  });

  function updateAvatar({ src, data }) {
    const userinfo = userStore.getUserInfo;
    userinfo.avatar = src;
    userStore.setUserInfo(userinfo);
  }

  async function handleSubmit() {
    loadingFlag.value = true;
    const form = await validate();
    await updateMyInfoApi(form);

    const userinfo = userStore.getUserInfo;
    userinfo.nickname = form.nickname;
    userStore.setUserInfo(userinfo);

    createMessage.success('更新成功！');
    loadingFlag.value = false;
  }
</script>

<style lang="less" scoped>
  .change-avatar {
    img {
      display: block;
      margin-bottom: 15px;
      border-radius: 50%;
    }
  }
</style>
