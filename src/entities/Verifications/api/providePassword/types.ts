import { isValid, isPast, isFuture } from 'date-fns';
import { z } from 'zod';
import { onlyEnLettersTextSchema } from '@/shared/api/resolvers';

export const ProvidePassportArgsSchema = z.object({
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
  expiryAt: z.null().or(
    z.date().refine(
      (dateStr) => {
        const date = new Date(dateStr);
        return isValid(date) && isFuture(date);
      },
      {
        message: 'Expiry date must be a valid future date',
      },
    ),
  ),

  firstPackFileIds: z.array(z.number()).min(1),
  secondPackFileIds: z.array(z.number()).min(1),
});

export type ProvidePassportArgsSchema = z.infer<
  typeof ProvidePassportArgsSchema
>;
