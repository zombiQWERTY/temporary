import { useMutation } from '@tanstack/react-query';

import { UpdateProfileApi } from '@/entities/Profiles';
import { TaxpayerDataSchema } from '../model/types';

export const useUpdateTaxpayerProfileData = () => {
  const dataQuery = useMutation({
    mutationFn: async (data: TaxpayerDataSchema) => {
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
