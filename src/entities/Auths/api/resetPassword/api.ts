import { apiClientGuest } from '@/shared/api';
import { ResetPasswordArgsSchema, ResetPasswordDtoSchema } from './types';

const url = 'auth/reset-password' as const;

export const request = (data: ResetPasswordArgsSchema) => {
  return apiClientGuest.post<
    typeof ResetPasswordArgsSchema,
    typeof ResetPasswordDtoSchema
  >(url, {
    dto: data,
    schema: ResetPasswordArgsSchema,
    responseSchema: ResetPasswordDtoSchema,
  });
};
