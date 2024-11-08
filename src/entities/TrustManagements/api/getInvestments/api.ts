import { apiClient, ListApiFnArgs } from '@/shared/api';
import { GetInvestmentsDtoSchema } from './types';

const url = '/products-tm/my-investments' as const;

export const request = async (args?: ListApiFnArgs) => {
  return apiClient.get<typeof GetInvestmentsDtoSchema>(
    url,
    {
      responseSchema: GetInvestmentsDtoSchema,
    },
    {
      params: args,
    },
  );
};
