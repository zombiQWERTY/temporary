import { z } from 'zod';

export const DocumentFileSchema = z.object({
  id: z.number(),
  mimeType: z.string(),
  size: z.number(),
  thumbnailUrl: z.string().nullable(),
  url: z.string(),
  fileName: z.string(),
});

export type DocumentFileSchema = z.infer<typeof DocumentFileSchema>;

export const UploadDocumentDtoSchema = z.object({
  fileIds: z.array(z.number()),
  files: z.array(DocumentFileSchema),
});

export type UploadDocumentDtoSchema = z.infer<typeof UploadDocumentDtoSchema>;
