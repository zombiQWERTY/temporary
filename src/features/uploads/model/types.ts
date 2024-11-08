import { z } from 'zod';

export enum UploadedFileStateEnum {
  Success = 'success',
  Loading = 'loading',
  Error = 'error',
}

export const InternalFileSchema = z.object({
  internalId: z.string(), // id, который используется внутри нашего загрузчика, uuid
  externalId: z.number().nullable(), // внешний id, который мы возвращаем в форму после загрузки нового файла
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  state: z.nativeEnum(UploadedFileStateEnum),
  thumbnailUrl: z.string().nullable(),
  isNewFile: z.boolean(), // Флаг, по которому определяем, это новый файл или старый
  freshlyAddedFile: z.instanceof(File).optional(), // Тут хранится свежезагруженный File
});

export type InternalFileSchema = z.infer<typeof InternalFileSchema>;

export type FilesUploadProgress = Record<string, number>;

export enum MimeTypesEnum {
  ALL = '*',
  IMAGE_ALL = 'image/*',
  VIDEO_ALL = 'video/*',
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_WEBP = 'image/webp',
  IMAGE_PJPEG = 'image/pjpeg',
  IMAGE_PNG = 'image/png',
  MSWORD = 'application/msword',
  OPEN_XML = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PDF = 'application/pdf',
  CSV = 'text/csv',
}
