import { apiClient, ListApiFnArgs } from '@/shared/api';
import { GetRecentTransactionsDtoSchema } from './types';

const url = '/accounts/recent-transactions' as const;

export const request = (accountId?: number, args?: ListApiFnArgs) => {
  return apiClient.get<typeof GetRecentTransactionsDtoSchema>(
    `${url}/${accountId}`,
    { responseSchema: GetRecentTransactionsDtoSchema },
    {
      params: args,
    },
  );
};
