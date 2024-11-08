import { z } from 'zod';
import { TaxPayerProfileDtoSchema } from '@/shared/commonProjectParts';

export const ProvideTaxPayerArgsSchema = TaxPayerProfileDtoSchema.omit({
  userId: true,
  id: true,
}).extend({
  fileIds: z.array(z.number()),
});

export type ProvideTaxPayerArgsSchema = z.infer<
  typeof ProvideTaxPayerArgsSchema
>;
