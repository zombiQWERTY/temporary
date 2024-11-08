import { useMutation } from '@tanstack/react-query';

import { ConfirmVerificationApi } from '@/entities/Verifications';

export const useSignContractRequest = () => {
  const dataQuery = useMutation({
    mutationFn: async (
      data: ConfirmVerificationApi.ProvideConfirmVerificationArgsSchema,
    ) => {
      await ConfirmVerificationApi.request(data);
    },
  });

  const { data, error, mutateAsync } = dataQuery;

  return {
    response: data,
    error,
    mutateAsync,
  };
};
