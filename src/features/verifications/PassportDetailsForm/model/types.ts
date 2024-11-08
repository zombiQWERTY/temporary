import { z } from 'zod';
import { InternalFileSchema } from '@/features/uploads';
import { UpdateProfileApi } from '@/entities/Profiles';
import { ProvidePassportApi } from '@/entities/Verifications';

// @TODO: error in console. Add superRefine to handle two states: first one is when no files uploaded earlier. Second one is when uploaded earlier files exists
export const FilesSchema = z
  .array(InternalFileSchema)
  .min(1, { message: 'Should add minimum 1 photo' });

export const UserDataSchema = UpdateProfileApi.UpdateProfileArgsSchema.pick({
  firstName: true,
  lastName: true,
  birthdate: true,
});

export type UserDataSchema = z.infer<typeof UserDataSchema>;

export const PassportDataSchema =
  ProvidePassportApi.ProvidePassportArgsSchema.extend({
    firstPackFileIds: FilesSchema,
    secondPackFileIds: FilesSchema,
  });
