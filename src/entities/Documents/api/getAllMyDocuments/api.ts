import { apiClient } from '@/shared/api';
import { GetAllMyDocumentsSchema } from '../getAllMyDocuments';

const url = '/users/user-documents';

export const request = () => {
  return apiClient.get<typeof GetAllMyDocumentsSchema>(url, {
    responseSchema: GetAllMyDocumentsSchema,
  });
};
