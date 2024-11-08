import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { ProvideConfirmVerificationArgsSchema } from './types';

const url = '/users/confirm-verification' as const;

export const request = (args: ProvideConfirmVerificationArgsSchema) => {
  return apiClient.post<
    typeof ProvideConfirmVerificationArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: ProvideConfirmVerificationArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
