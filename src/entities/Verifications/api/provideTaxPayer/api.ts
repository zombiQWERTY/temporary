import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { ProvideTaxPayerArgsSchema } from './types';

const url = '/users/provide-tax-to-verification' as const;

export const request = (args: ProvideTaxPayerArgsSchema) => {
  return apiClient.post<
    typeof ProvideTaxPayerArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: ProvideTaxPayerArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
