import { z } from 'zod';
import { EconomicProfileDtoSchema } from '@/shared/commonProjectParts';

export const EconomicDataSchema = z.object({
  economicProfile: EconomicProfileDtoSchema.omit({
    id: true,
    userId: true,
  }),
});

export type EconomicDataSchema = z.infer<typeof EconomicDataSchema>;
