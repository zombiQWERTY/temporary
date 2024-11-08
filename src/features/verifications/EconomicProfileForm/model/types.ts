import { z } from 'zod';

import { InternalFileSchema } from '@/features/uploads';
import { EconomicProfileDtoSchema } from '@/shared/commonProjectParts';

const FilesSchema = z.array(InternalFileSchema);

export const EconomicVerificationFormSchema = EconomicProfileDtoSchema.omit({
  id: true,
  userId: true,
}).extend({
  fileIds: FilesSchema,
});

export const ProvideEconomicVerificationFormSchema =
  EconomicVerificationFormSchema.extend({
    fileIds: z.array(z.number()),
  });

export type ProvideEconomicVerificationFormSchema = z.infer<
  typeof ProvideEconomicVerificationFormSchema
>;

export type EconomicVerificationFormSchema = z.infer<
  typeof EconomicVerificationFormSchema
>;
