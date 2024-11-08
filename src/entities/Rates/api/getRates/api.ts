import { apiClient } from '@/shared/api';
import { GetRatesDtoSchema } from './types';

const url = '/rates/latest' as const;

export const request = () => {
  return apiClient.get<typeof GetRatesDtoSchema>(url, {
    responseSchema: GetRatesDtoSchema,
  });
};
