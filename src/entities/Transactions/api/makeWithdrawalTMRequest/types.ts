import { z } from 'zod';

export const MakeWithdrawalTMRequestArgsSchema = z.object({
  sharesAmount: z.preprocess(
    (x) => (x ? x : undefined),
    z.coerce.number().int().min(1),
  ),
  investmentId: z.number().min(1),
  code: z.string().min(1),
});

export type MakeWithdrawalTMRequestArgsSchema = z.infer<
  typeof MakeWithdrawalTMRequestArgsSchema
>;
