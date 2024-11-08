import { apiClient } from '@/shared/api';
import { GetMyAccountByIdDtoSchema } from './types';

const url = '/accounts/my-accounts' as const;

export const request = (accountId: string | number) => {
  return apiClient.get<typeof GetMyAccountByIdDtoSchema>(
    `${url}/${accountId}`,
    { responseSchema: GetMyAccountByIdDtoSchema },
  );
};
