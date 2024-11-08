import { useMutation } from '@tanstack/react-query';

import { ProvideLocationApi } from '@/entities/Verifications';

export const useProvideLocation = () => {
  const dataQuery = useMutation({
    mutationFn: async ({
      locationData,
    }: {
      locationData: ProvideLocationApi.ProvideLocationArgsSchema;
    }) => {
      await ProvideLocationApi.request(locationData);
    },
  });

  const { data, error, mutateAsync } = dataQuery;

  return {
    response: data,
    error,
    mutateAsync,
  };
};
