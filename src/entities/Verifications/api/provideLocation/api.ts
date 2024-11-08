import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { ProvideLocationArgsSchema } from './types';

const url = '/users/provide-location-to-verification' as const;

export const request = (args: ProvideLocationArgsSchema) => {
  return apiClient.post<
    typeof ProvideLocationArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: ProvideLocationArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
