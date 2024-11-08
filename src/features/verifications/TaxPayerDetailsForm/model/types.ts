import { z } from 'zod';

import { InternalFileSchema } from '@/features/uploads';
import { TaxPayerProfileDtoSchema } from '@/shared/commonProjectParts';

const FilesSchema = z
  .array(InternalFileSchema)
  .min(1, { message: 'Should add minimum 1 photo' });

export const TaxPayerVerificationFormSchema = TaxPayerProfileDtoSchema.omit({
  id: true,
  userId: true,
}).extend({
  fileIds: FilesSchema,
});

export const ProvideTaxPayerVerificationFormSchema =
  TaxPayerVerificationFormSchema.extend({
    fileIds: z.array(z.number().min(1)),
  });

export type ProvideTaxPayerVerificationFormSchema = z.infer<
  typeof ProvideTaxPayerVerificationFormSchema
>;

export type TaxPayerVerificationFormSchema = z.infer<
  typeof TaxPayerVerificationFormSchema
>;
