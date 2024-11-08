import { z } from 'zod';

import { UpdateProfileApi } from '@/entities/Profiles';

export const PersonalDataSchema = UpdateProfileApi.UpdateProfileArgsSchema.pick(
  {
    firstName: true,
    lastName: true,
    middleName: true,
  },
).required();

export type PersonalDataSchema = z.infer<typeof PersonalDataSchema>;
