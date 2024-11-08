import { z } from 'zod';
import { CurrencyCodesEnum } from '@/shared/commonProjectParts';

const AccountBalanceSchema = z.object({
  balance: z.string().transform(BigInt),
  currencyCode: z.nativeEnum(CurrencyCodesEnum),
});

export type AccountBalanceSchema = z.infer<typeof AccountBalanceSchema>;

export const GetMyBalanceDtoSchema = z.object({
  balances: z.array(AccountBalanceSchema),
});

export type GetMyBalanceDtoSchema = z.infer<typeof GetMyBalanceDtoSchema>;
