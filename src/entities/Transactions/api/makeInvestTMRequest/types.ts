import { z } from 'zod';

export const MakeInvestTMRequestArgsSchema = z.object({
  amount: z.preprocess(
    (x) => (x ? x : undefined),
    z.coerce.number().int().min(1),
  ),
  strategyId: z.number().min(1),
  currency: z.string().min(1),
  code: z.string().min(1),
});

export type MakeInvestTMRequestArgsSchema = z.infer<
  typeof MakeInvestTMRequestArgsSchema
>;
