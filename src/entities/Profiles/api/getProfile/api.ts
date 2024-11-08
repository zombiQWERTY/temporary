import { apiClient } from '@/shared/api';
import { ProfileDtoSchema } from '@/shared/commonProjectParts';

const url = '/users/profile' as const;

export const fetchProfileRequest = () => {
  return apiClient.get<typeof ProfileDtoSchema>(url, {
    responseSchema: ProfileDtoSchema,
  });
};
