import { apiClient, ListApiFnArgs } from '@/shared/api';
import { GetMyAccountsDtoSchema } from './types';

const url = '/accounts/my-accounts' as const;

export const request = (args?: ListApiFnArgs) => {
  return apiClient.get<typeof GetMyAccountsDtoSchema>(
    url,
    {
      responseSchema: GetMyAccountsDtoSchema,
    },
    {
      params: args,
    },
  );
};
