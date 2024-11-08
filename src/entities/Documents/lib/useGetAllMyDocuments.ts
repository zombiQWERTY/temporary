'use client';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetAllMyDocumentsSchema, request } from '../api/getAllMyDocuments';

const QUERY_KEY = 'getAllMyDocuments';

interface UseGetAllMyDocumentsProps {
  initialData?: GetAllMyDocumentsSchema;
}

export const useGetAllMyDocuments = (props?: UseGetAllMyDocumentsProps) => {
  const queryResult: UseQueryResult<GetAllMyDocumentsSchema, Error> = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: request,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3,
    initialData: props?.initialData,
  });

  const { data, error, isLoading, isFetching, refetch, isFetched } =
    queryResult;

  return {
    response: data,
    isFetched,
    refetch,
    error,
    isLoading,
    isValidating: isFetching,
  };
};
