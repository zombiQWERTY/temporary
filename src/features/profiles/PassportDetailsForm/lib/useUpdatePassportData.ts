import { useMutation } from '@tanstack/react-query';

import { UpdateProfileApi } from '@/entities/Profiles';
import { PassportDataSchema } from '../model/types';

export const useUpdatePassportData = () => {
  const dataQuery = useMutation({
    mutationFn: async (data: PassportDataSchema) => {
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
