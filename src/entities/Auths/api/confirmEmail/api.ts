import { apiClientGuest, SuccessDtoSchema } from '@/shared/api';
import { ConfirmEmailArgsSchema } from './types';

const url = '/auth/signup/confirm-email' as const;

export const request = (data: ConfirmEmailArgsSchema) => {
  return apiClientGuest.post<
    typeof ConfirmEmailArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: data,
    schema: ConfirmEmailArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
