import { z } from 'zod';
import { EconomicProfileDtoSchema } from '@/shared/commonProjectParts';

export const ProvideEconomicProfileArgsSchema = EconomicProfileDtoSchema.omit({
  userId: true,
  id: true,
}).extend({
  fileIds: z.array(z.number()),
});

export type ProvideEconomicProfileArgsSchema = z.infer<
  typeof ProvideEconomicProfileArgsSchema
>;
