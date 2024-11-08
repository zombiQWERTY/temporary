import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { ProvidePassportArgsSchema } from './types';

const url = '/users/provide-passport-to-verification' as const;

export const request = (args: ProvidePassportArgsSchema) => {
  return apiClient.post<
    typeof ProvidePassportArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: ProvidePassportArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
