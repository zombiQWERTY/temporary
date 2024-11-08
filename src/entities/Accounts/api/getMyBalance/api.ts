import { apiClient } from '@/shared/api';
import { GetMyBalanceDtoSchema } from './types';

const url = '/accounts/balance' as const;

export const request = () => {
  return apiClient.get<typeof GetMyBalanceDtoSchema>(url, {
    responseSchema: GetMyBalanceDtoSchema,
  });
};
