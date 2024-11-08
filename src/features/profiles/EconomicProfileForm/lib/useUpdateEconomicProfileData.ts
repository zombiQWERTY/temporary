import { useMutation } from '@tanstack/react-query';

import { UpdateProfileApi } from '@/entities/Profiles';
import { EconomicDataSchema } from '../model/types';

export const useUpdateEconomicProfileData = () => {
  const dataQuery = useMutation({
    mutationFn: async (data: EconomicDataSchema) => {
      await UpdateProfileApi.request(data);
    },
  });

  const { data, error, mutateAsync } = dataQuery;

  return {
    response: data,
    error,
    mutateAsync,
  };
};
