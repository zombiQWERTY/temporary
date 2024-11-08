import { z } from 'zod';
import { onlyEnLettersTextSchema } from '@/shared/api/resolvers';

export const MakeWithdrawalRequestArgsSchema = z.object({
  accountId: z.number().min(1),
  currency: z.string().min(1),
  amount: z.preprocess(
    (x) => (x ? x : undefined),
    z.coerce.number().int().min(1),
  ),
  details: z.object({
    countryCode: z.string().min(1),
    iban: onlyEnLettersTextSchema.min(1),
    bic: onlyEnLettersTextSchema.min(1),
    bankName: onlyEnLettersTextSchema.min(1),
    recipientName: onlyEnLettersTextSchema.min(1),
    purposeOfPayment: onlyEnLettersTextSchema.min(1),
  }),
  code: z.string().min(1),
});

export type MakeWithdrawalRequestArgsSchema = z.infer<
  typeof MakeWithdrawalRequestArgsSchema
>;
