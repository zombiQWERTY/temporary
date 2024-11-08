import { z } from 'zod';

export const MakeTransferBetweenAccountsRequestArgsSchema = z.object({
  amount: z.preprocess(
    (x) => (x ? x : undefined),
    z.coerce.number().int().min(1),
  ),
  fromAccountId: z.number().min(1),
  targetAccountId: z.coerce.number().min(1),
  currency: z.string().min(1),
  code: z.string().min(1),
});

export type MakeTransferBetweenAccountsRequestArgsSchema = z.infer<
  typeof MakeTransferBetweenAccountsRequestArgsSchema
>;
