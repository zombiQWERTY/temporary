'use client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetMyAccountsDtoSchema } from '../api/getMyAccounts';
import { request } from '../api/getMyAccounts/api';

const QUERY_KEY = 'getMyAccounts';

interface UseGetMyAccountsProps {
  initialData: GetMyAccountsDtoSchema | null;
}

export const useGetMyAccounts = (props?: UseGetMyAccountsProps) => {
  const queryResult: UseQueryResult<GetMyAccountsDtoSchema, Error> = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => request(),
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    initialData: props?.initialData,
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
