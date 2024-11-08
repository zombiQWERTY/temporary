import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { MakeDepositRequestArgsSchema } from './types';

const url = '/accounts/deposit' as const;

export const request = async (args: MakeDepositRequestArgsSchema) => {
  return apiClient.post<
    typeof MakeDepositRequestArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: MakeDepositRequestArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
