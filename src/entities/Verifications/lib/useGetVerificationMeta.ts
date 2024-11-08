import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetVerificationMetaDtoSchema } from '../api/getVerificationMeta';
import { request } from '../api/getVerificationMeta/api';

const QUERY_KEY = 'getVerificationMeta';

export const useGetVerificationMeta = () => {
  const queryResult: UseQueryResult<GetVerificationMetaDtoSchema, Error> =
    useQuery({
      queryKey: [QUERY_KEY],
      queryFn: request,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
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
