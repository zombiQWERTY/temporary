import { useMutation } from '@tanstack/react-query';

import { UpdateProfileApi } from '@/entities/Profiles';
import { LocationDataSchema } from '../model/types';

export const useUpdateAddressData = () => {
  const dataQuery = useMutation({
    mutationFn: async (data: LocationDataSchema) => {
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
