import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { MakeWithdrawalTMRequestArgsSchema } from './types';

const url = '/accounts/withdraw-tm-transfer' as const;

export const request = (args: MakeWithdrawalTMRequestArgsSchema) => {
  return apiClient.post<
    typeof MakeWithdrawalTMRequestArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: MakeWithdrawalTMRequestArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
