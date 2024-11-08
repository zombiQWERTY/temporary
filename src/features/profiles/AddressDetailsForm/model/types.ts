import { z } from 'zod';

import { LocationDtoSchema } from '@/shared/commonProjectParts';

export const LocationDataSchema = z.object({
  location: LocationDtoSchema.omit({
    id: true,
    userId: true,
  }),
});

export type LocationDataSchema = z.infer<typeof LocationDataSchema>;
