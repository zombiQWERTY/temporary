import { useMutation } from '@tanstack/react-query';

import { UpdateProfileApi } from '@/entities/Profiles';
import { ProvidePassportApi } from '@/entities/Verifications';
import { UserDataSchema } from '../model/types';

export const useProvidePassport = () => {
  const dataQuery = useMutation({
    mutationFn: async ({
      userData,
      passportData,
    }: {
      userData: UserDataSchema;
      passportData: ProvidePassportApi.ProvidePassportArgsSchema;
    }) => {
      await UpdateProfileApi.request(userData);
      await ProvidePassportApi.request(passportData);
    },
  });

  const { data, error, mutateAsync } = dataQuery;

  return {
    response: data,
    error,
    mutateAsync,
  };
};
