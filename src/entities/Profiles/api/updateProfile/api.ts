import { apiClient } from '@/shared/api';
import { UpdateProfileArgsSchema, UpdateProfileDtoSchema } from './types';

const url = '/users/profile' as const;

export const request = async (args: UpdateProfileArgsSchema) => {
  return apiClient.patch<
    typeof UpdateProfileArgsSchema,
    typeof UpdateProfileDtoSchema
  >(url, {
    dto: args,
    schema: UpdateProfileArgsSchema,
    responseSchema: UpdateProfileDtoSchema,
  });
};
