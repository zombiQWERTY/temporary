'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  GetRecentTransactionsDtoSchema,
  request,
} from '../api/getRecentTransactions';

const MY_TRANSACTIONS_QUERY_KEY = 'myTransactions';

interface UseMyTransactionsProps {
  accountId?: number;
  initialData: GetRecentTransactionsDtoSchema | null;
  take?: number;
}

export const useMyTransactions = ({
  accountId,
  initialData,
  take,
}: UseMyTransactionsProps) => {
  const queryResult: UseQueryResult<GetRecentTransactionsDtoSchema, Error> =
    useQuery({
      queryKey: [MY_TRANSACTIONS_QUERY_KEY, accountId, { take }],
      queryFn: () => request(accountId, { take }),
      staleTime: 30000,
      refetchOnWindowFocus: true,
      retry: 3,
      initialData,
      placeholderData: {
        list: [],
        count: 0,
        take: take || 20,
        pageIndex: 0,
        skip: 0,
      },
    });

  const { data, error, isLoading, isFetching, refetch } = queryResult;

  return {
    response: data,
    refetch,
    error,
    isLoading,
    isValidating: isFetching,
  };
};
