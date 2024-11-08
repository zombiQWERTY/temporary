'use client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetStrategyByIdDtoSchema } from '../api/getStrategyById';
import { request } from '../api/getStrategyById/api';

const QUERY_KEY = 'getStrategyById';

interface UseGetStrategyByIdProps {
  initialData: GetStrategyByIdDtoSchema | null;
  strategyId: number;
}

export const useGetStrategyById = ({
  initialData,
  strategyId,
}: UseGetStrategyByIdProps) => {
  const queryResult: UseQueryResult<GetStrategyByIdDtoSchema, Error> = useQuery(
    {
      queryKey: [QUERY_KEY, strategyId],
      queryFn: () => request(strategyId),
      staleTime: 30000,
      refetchOnWindowFocus: true,
      retry: 3,
      initialData,
    },
  );

  const { data, error, isLoading, isFetching, refetch } = queryResult;

  return {
    response: data,
    refetch,
    error,
    isLoading,
    isValidating: isFetching,
  };
};
