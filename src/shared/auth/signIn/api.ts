import { apiClient } from '@/shared/api';
import { SignInArgsSchema, SignInDtoSchema } from './types';

const url = '/auth/signin/client' as const;

export const request = (data: SignInArgsSchema) => {
  return apiClient.post<typeof SignInArgsSchema, typeof SignInDtoSchema>(url, {
    dto: data,
    schema: SignInArgsSchema,
    responseSchema: SignInDtoSchema,
  });
};
