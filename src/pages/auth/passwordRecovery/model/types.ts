import { z } from 'zod';

import { ConfirmResetPasswordApi } from '@/entities/Auths';

export enum PageTypeEnum {
  Recovery = 'recovery',
  NewPassword = 'newPassword',
  Confirm = 'confirm',
}

export const NewPasswordArgsSchema =
  ConfirmResetPasswordApi.NewPasswordArgsSchema.omit({
    code: true,
    email: true,
  })
    .extend({
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      // @TODO: i18n
      message: 'Passwords must match!',
      path: ['confirmPassword'],
    });

export type NewPasswordArgsSchema = z.infer<typeof NewPasswordArgsSchema>;
