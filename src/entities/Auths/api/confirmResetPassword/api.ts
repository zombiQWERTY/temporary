import { apiClientGuest, SuccessDtoSchema } from '@/shared/api';
import { NewPasswordArgsSchema } from './types';

const url = 'auth/reset-password/confirm' as const;

export const request = (data: NewPasswordArgsSchema) => {
  return apiClientGuest.post<
    typeof NewPasswordArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: data,
    schema: NewPasswordArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
