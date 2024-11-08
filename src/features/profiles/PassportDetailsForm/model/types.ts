import { z } from 'zod';

import { UpdateProfileApi } from '@/entities/Profiles';

export const PassportDataSchema = UpdateProfileApi.UpdateProfileArgsSchema.pick(
  {
    birthdate: true,
    passport: true,
  },
).required();

export type PassportDataSchema = z.infer<typeof PassportDataSchema>;
