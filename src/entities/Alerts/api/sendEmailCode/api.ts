import { apiClient, apiClientGuest } from '@/shared/api';
import { SendCodeArgsSchema, SendCodeDtoSchema } from './types';

export const request = (
  data: SendCodeArgsSchema,
  { hasUser }: { hasUser: boolean },
) => {
  const url = hasUser
    ? 'alert/send-email-code-logged'
    : 'alert/send-email-code';

  const api = hasUser ? apiClient : apiClientGuest;

  return api.post<typeof SendCodeArgsSchema, typeof SendCodeDtoSchema>(url, {
    dto: data,
    schema: SendCodeArgsSchema,
    responseSchema: SendCodeDtoSchema,
  });
};
