import { AxiosProgressEvent, AxiosRequestConfig } from 'axios';
import { identity } from 'ramda';
import { z } from 'zod';

import { apiClient } from '@/shared/api';
import { UploadDocumentDtoSchema } from './types';

const URL = '/files/upload' as const;
const blankSchema = z.object({});

interface FileToUpload {
  internalId: string;
  file: File;
}

interface UploadOptions {
  files: FileToUpload[];
  onUploadProgress: (id: string) => (progress: AxiosProgressEvent) => void;
}

const createFormData = (files: FileToUpload[]): FormData => {
  const formData = new FormData();
  files.forEach(({ file }) => formData.append('files', file, file.name));
  return formData;
};

const createHeaders = (): Pick<AxiosRequestConfig, 'headers'>['headers'] => ({
  'Content-Type': 'multipart/form-data',
});

const handleUploadProgress = (
  files: FileToUpload[],
  onUploadProgress: UploadOptions['onUploadProgress'],
) => {
  return files.length === 1 ? onUploadProgress(files[0].internalId) : identity;
};

export const request = ({ files, onUploadProgress }: UploadOptions) => {
  return apiClient.post<typeof blankSchema, typeof UploadDocumentDtoSchema>(
    URL,
    {
      dto: createFormData(files),
      schema: blankSchema,
      responseSchema: UploadDocumentDtoSchema,
    },
    {
      headers: createHeaders(),
      onUploadProgress: handleUploadProgress(files, onUploadProgress),
    },
  );
};
