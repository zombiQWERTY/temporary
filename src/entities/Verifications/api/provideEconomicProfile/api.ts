import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { ProvideEconomicProfileArgsSchema } from './types';

const url = '/users/provide-economic-to-verification' as const;

export const request = (args: ProvideEconomicProfileArgsSchema) => {
  return apiClient.post<
    typeof ProvideEconomicProfileArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: ProvideEconomicProfileArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
