import { useMutation } from '@tanstack/react-query';

import { ProvideEconomicProfileApi } from '@/entities/Verifications';

export const useProvideEconomicProfile = () => {
  const dataQuery = useMutation({
    mutationFn: async (
      data: ProvideEconomicProfileApi.ProvideEconomicProfileArgsSchema,
    ) => {
      await ProvideEconomicProfileApi.request(data);
    },
  });

  const { data, error, mutateAsync } = dataQuery;

  return {
    response: data,
    error,
    mutateAsync,
  };
};
