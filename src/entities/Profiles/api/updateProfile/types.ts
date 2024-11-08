import { isFuture, isPast, isValid } from 'date-fns';
import { z } from 'zod';
import { onlyEnLettersTextSchema } from '@/shared/api/resolvers';
import {
  LocationDtoSchema,
  TaxPayerProfileDtoSchema,
  EconomicProfileDtoSchema,
  ProfileDtoSchema,
} from '@/shared/commonProjectParts';

export const UpdateProfileArgsSchema = z
  .object({
    phone: z.string(),
    email: z.string().email(),
    firstName: onlyEnLettersTextSchema.min(1),
    middleName: onlyEnLettersTextSchema,
    lastName: onlyEnLettersTextSchema.min(1),
    birthdate: z.date().refine((date) => isValid(date) && isPast(date), {
      message: 'Birthdate date must be a valid past date',
    }),
    workPhone: z.string(),
    passport: z.object({
      documentNumber: onlyEnLettersTextSchema,
      authorityDate: z.date().refine((date) => isValid(date) && isPast(date), {
        message: 'Authority date must be a valid past date',
      }),
      authority: onlyEnLettersTextSchema.min(1),
      citizenshipCountryCode: z.string().min(1),

      originCountryCode: z.string().min(1),
      placeOfBirth: onlyEnLettersTextSchema.min(1, {
        message: 'Place of birth cannot be empty',
      }),
      noExpirationDate: z.boolean().nullable(),
      expiryAt: z
        .date()
        .nullable()
        .refine((date) => (date ? isValid(date) && isFuture(date) : true), {
          message: 'Expiry date must be a valid future date',
        }),
    }),
    location: LocationDtoSchema.partial(),
    economicProfile: EconomicProfileDtoSchema.partial(),
    taxPayerProfile: TaxPayerProfileDtoSchema.partial(),
  })
  // @TODO: I am not sure that using partial here is correct
  .partial();

export type UpdateProfileArgsSchema = z.infer<typeof UpdateProfileArgsSchema>;

export const UpdateProfileDtoSchema = ProfileDtoSchema.omit({
  auth: true,
  branches: true,
  documents: true,
  economicProfile: true,
  taxPayerProfile: true,
  mainBranchId: true,
  mainRole: true,
});
