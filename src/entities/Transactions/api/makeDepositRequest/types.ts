import { z } from 'zod';

export const MakeDepositRequestArgsSchema = z.object({
  accountId: z.number().min(1),
  currency: z.string().min(1),
  amount: z.preprocess(
    (x) => (x ? x : undefined),
    z.coerce.number().int().min(1),
  ),
});

export type MakeDepositRequestArgsSchema = z.infer<
  typeof MakeDepositRequestArgsSchema
>;
