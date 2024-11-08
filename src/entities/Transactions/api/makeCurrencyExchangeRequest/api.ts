import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { MakeCurrencyExchangeRequestArgsSchema } from './types';

const url = '/accounts/internal-change' as const;

export const request = async (args: MakeCurrencyExchangeRequestArgsSchema) => {
  return apiClient.post<
    typeof MakeCurrencyExchangeRequestArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: MakeCurrencyExchangeRequestArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
