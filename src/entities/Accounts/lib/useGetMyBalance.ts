'use client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSortBalances } from '@/entities/Accounts/lib/useSortBalances';
import { GetMyBalanceDtoSchema } from '../api/getMyBalance';
import { request } from '../api/getMyBalance/api';

const QUERY_KEY = ['myBalance'];

interface UseGetMyBalanceProps {
  initialData: GetMyBalanceDtoSchema | undefined;
}

export const useGetMyBalance = ({ initialData }: UseGetMyBalanceProps) => {
  const queryResult: UseQueryResult<GetMyBalanceDtoSchema, Error> = useQuery({
    queryKey: QUERY_KEY,
    queryFn: request,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    initialData,
    placeholderData: { balances: [] },
  });

  const { data, error, isLoading, isFetching, refetch } = queryResult;

  const balancesMap = useSortBalances({
    balances: data?.balances || [],
  });

  return {
    response: balancesMap,
    refetch,
    error,
    isLoading,
    isValidating: isFetching,
  };
};
