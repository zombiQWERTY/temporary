'use client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetMyAccountByIdDtoSchema } from '../api/getAccountById';
import { request } from '../api/getAccountById/api';

const QUERY_KEY = 'getAccountById';

interface UseGetAccountByIdProps {
  initialData: GetMyAccountByIdDtoSchema | null;
  accountId: number | string;
}

export const useGetAccountById = ({
  initialData,
  accountId,
}: UseGetAccountByIdProps) => {
  const queryResult: UseQueryResult<GetMyAccountByIdDtoSchema, Error> =
    useQuery({
      queryKey: [QUERY_KEY, accountId],
      queryFn: () => request(accountId),
      staleTime: 30000,
      refetchOnWindowFocus: true,
      retry: 3,
      initialData,
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
