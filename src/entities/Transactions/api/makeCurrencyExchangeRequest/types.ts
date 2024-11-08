import { z } from 'zod';

export const MakeCurrencyExchangeRequestArgsSchema = z.object({
  amount: z.preprocess(
    (x) => (x ? x : undefined),
    z.coerce.number().int().min(1),
  ),
  fromAccountId: z.number().min(1),
  fromCurrency: z.string().min(1),
  toCurrency: z.string().min(1),
  code: z.string().min(1),
});

export type MakeCurrencyExchangeRequestArgsSchema = z.infer<
  typeof MakeCurrencyExchangeRequestArgsSchema
>;
