import { useMutation } from '@tanstack/react-query';

import { ProvideExtraApi } from '@/entities/Verifications';

export const useProvideExtraDocumentsData = () => {
  const dataQuery = useMutation({
    mutationFn: async (data: ProvideExtraApi.ProvideExtraArgsSchema) => {
      await ProvideExtraApi.request(data);
    },
  });

  const { data, error, mutateAsync } = dataQuery;

  return {
    response: data,
    error,
    mutateAsync,
  };
};
