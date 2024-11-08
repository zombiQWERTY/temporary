import { z } from 'zod';
import { DocumentTypeEnum } from '../../model';

export const ServerDocument = z.object({
  id: z.number(),
  fileId: z.number(),
  fileName: z.string(),

  type: z.nativeEnum(DocumentTypeEnum),
  url: z.string(),
  thumbnailUrl: z.string().nullable(),
  mimeType: z.string(),
  size: z.number(),
});

export type ServerDocument = z.infer<typeof ServerDocument>;

export const GetAllMyDocumentsSchema = z.object({
  documents: z.array(ServerDocument),
});

export type GetAllMyDocumentsSchema = z.infer<typeof GetAllMyDocumentsSchema>;
