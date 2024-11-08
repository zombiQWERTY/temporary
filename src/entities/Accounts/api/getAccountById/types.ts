import { parseISO } from 'date-fns';
import { z } from 'zod';

import {
  AccountTypeEnum,
  CurrencyCodesEnum,
} from '@/shared/commonProjectParts';

export const SubAccountSchema = z.object({
  id: z.number(),
  balance: z.string().transform(BigInt),
  currencyCode: z.nativeEnum(CurrencyCodesEnum),
  isPrimary: z.boolean(),

  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export type SubAccountSchema = z.infer<typeof SubAccountSchema>;

export const WalletNumberSchema = z.object({
  id: z.number(),
  accountId: z.number(),
  walletId: z.string(),
});

export const AccountSchema = z.object({
  id: z.number(),
  ownerId: z.number(),
  accountType: z.nativeEnum(AccountTypeEnum),
  subAccounts: z.array(SubAccountSchema),
  walletNumber: WalletNumberSchema,
  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export type AccountSchema = z.infer<typeof AccountSchema>;

export const GetMyAccountByIdDtoSchema = z.object({
  account: AccountSchema,
});

export type GetMyAccountByIdDtoSchema = z.infer<
  typeof GetMyAccountByIdDtoSchema
>;
