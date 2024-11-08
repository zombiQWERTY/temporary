import { z } from 'zod';
import { InternalFileSchema } from '@/features/uploads';
import { onlyEnLettersTextSchema } from '@/shared/api/resolvers';

export const FilesSchema = z
  .array(InternalFileSchema)
  .min(1, { message: 'Should add minimum 1 photo' });

export const ResidenceAddressFormSchema = z.object({
  countryOfResidenceCode: z.string().min(1),
  city: onlyEnLettersTextSchema.min(1),
  region: onlyEnLettersTextSchema.min(1),
  street: onlyEnLettersTextSchema.min(1),
  streetNo: onlyEnLettersTextSchema.min(1),
  flatNo: onlyEnLettersTextSchema.min(1),
  zipCode: onlyEnLettersTextSchema.min(1),
  fileIds: FilesSchema,
  // fileIds: z.optional(z.array(z.number().min(1))),
});

export const ProvideResidenceAddressSchema = ResidenceAddressFormSchema.extend({
  fileIds: z.array(z.number().min(1)),
});

export type ProvideResidenceAddressSchema = z.infer<
  typeof ProvideResidenceAddressSchema
>;
export type ResidenceAddressFormSchema = z.infer<
  typeof ResidenceAddressFormSchema
>;
