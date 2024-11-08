import { apiClient } from '@/shared/api';
import { SignUpArgsSchema, SignUpDtoSchema } from './types';

const url = '/auth/signup' as const;

// Here we init otp code sending. It is the first step of registration
export const request = (data: SignUpArgsSchema) => {
  return apiClient.post<typeof SignUpArgsSchema, typeof SignUpDtoSchema>(url, {
    dto: data,
    schema: SignUpArgsSchema,
    responseSchema: SignUpDtoSchema,
  });
};
