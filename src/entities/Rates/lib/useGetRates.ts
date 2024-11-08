'use client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetRatesDtoSchema } from '../api/getRates';
import { request } from '../api/getRates/api';

const QUERY_KEY = 'getRates';

export const useGetRates = () => {
  const queryResult: UseQueryResult<GetRatesDtoSchema, Error> = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => request(),
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  const { data, error, isLoading, isFetching, refetch, isFetched } =
    queryResult;

  const convertCurrencyData = (
    input: GetRatesDtoSchema,
  ): Record<string, number> => {
    return Object.entries(input).reduce((acc, [currencyCode, data]) => {
      return {
        ...acc,
        [currencyCode.toLowerCase()]: parseFloat(data.value),
      };
    }, {});
  };

  return {
    response: data ? convertCurrencyData(data) : {},
    refetch,
    error,
    isLoading,
    isValidating: isFetching,
    isFetched,
  };
};
