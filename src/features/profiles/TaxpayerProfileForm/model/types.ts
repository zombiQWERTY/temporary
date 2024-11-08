import { z } from 'zod';

import { TaxPayerProfileDtoSchema } from '@/shared/commonProjectParts';

export const TaxpayerDataSchema = z.object({
  taxPayerProfile: TaxPayerProfileDtoSchema.omit({
    id: true,
    userId: true,
  }),
});

export type TaxpayerDataSchema = z.infer<typeof TaxpayerDataSchema>;
