import {FormSchema} from '@/components/Form';

export const formSchema: FormSchema[] = [
  {
    field: 'oldPassword',
    label: '当前密码',
    component: 'InputPassword',
    required: true,
  },
  {
    field: 'newPassword',
    label: '新密码',
    component: 'StrengthMeter',
    componentProps: {
      placeholder: '新密码',
    },
    rules: [
      {
        required: true,
        message: '请输入新密码',
      },
    ],
  },
  {
    field: 'confirmNewPassword',
    label: '确认密码',
    component: 'InputPassword',

    dynamicRules: ({values}) => {
      return [
        {
          required: true,
          validator: (_, value) => {
            if (!value) {
              return Promise.reject(new Error('确认密码不能为空'));
            }
            if (value !== values.newPassword) {
              return Promise.reject(new Error('两次输入的密码不一致!'));
            }
            return Promise.resolve();
          },
        },
      ];
    },
  },
];
