import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { MakeInvestTMRequestArgsSchema } from './types';

const url = '/accounts/invest-tm-transfer' as const;

export const request = (args: MakeInvestTMRequestArgsSchema) => {
  return apiClient.post<
    typeof MakeInvestTMRequestArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: MakeInvestTMRequestArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
