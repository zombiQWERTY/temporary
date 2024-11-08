import { useMutation } from '@tanstack/react-query';

import { ProvideTaxPayerApi } from '@/entities/Verifications';

export const useProvideTaxPayer = () => {
  const dataQuery = useMutation({
    mutationFn: async (data: ProvideTaxPayerApi.ProvideTaxPayerArgsSchema) => {
      await ProvideTaxPayerApi.request(data);
    },
  });

  const { data, error, mutateAsync } = dataQuery;

  return {
    response: data,
    error,
    mutateAsync,
  };
};
