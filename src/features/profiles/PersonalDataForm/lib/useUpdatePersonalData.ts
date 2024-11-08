import { useMutation } from '@tanstack/react-query';

import { UpdateProfileApi } from '@/entities/Profiles';
import { PersonalDataSchema } from '../model/types';

export const useUpdatePersonalData = () => {
  const dataQuery = useMutation({
    mutationFn: async (data: PersonalDataSchema) => {
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
