import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { ProvideExtraArgsSchema } from './types';

const url = '/users/provide-extra-to-verification' as const;

export const request = (args: ProvideExtraArgsSchema) => {
  return apiClient.post<typeof ProvideExtraArgsSchema, typeof SuccessDtoSchema>(
    url,
    {
      dto: args,
      schema: ProvideExtraArgsSchema,
      responseSchema: SuccessDtoSchema,
    },
  );
};
