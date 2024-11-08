import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { MakeWithdrawalRequestArgsSchema } from './types';

const url = '/accounts/withdraw' as const;

export const request = (args: MakeWithdrawalRequestArgsSchema) => {
  return apiClient.post<
    typeof MakeWithdrawalRequestArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: MakeWithdrawalRequestArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
