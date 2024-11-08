import { apiClient } from '@/shared/api';
import { GetVerificationMetaDtoSchema } from './types';

const url = '/users/verification-meta' as const;

export const request = () => {
  return apiClient.get<typeof GetVerificationMetaDtoSchema>(url, {
    responseSchema: GetVerificationMetaDtoSchema,
  });
};
