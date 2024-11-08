import { z } from 'zod';
import { InternalFileSchema } from '@/features/uploads';
import { ProvideExtraApi } from '@/entities/Verifications';

export const FilesSchema = z
  .array(InternalFileSchema)
  .min(1, { message: 'Should add minimum 1 photo' });

export const ExtraDataSchema = ProvideExtraApi.ProvideExtraArgsSchema.extend({
  fileIds: FilesSchema,
});

export type ExtraDataSchema = z.infer<typeof ExtraDataSchema>;
