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
  walletNumber: WalletNumberSchema,
  subAccounts: z.array(SubAccountSchema),
  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export type AccountSchema = z.infer<typeof AccountSchema>;

export const GetMyAccountsDtoSchema = z.object({
  count: z.number(),
  take: z.number(),
  skip: z.number(),
  list: z.array(AccountSchema),
  pageIndex: z.number(),
});

export type GetMyAccountsDtoSchema = z.infer<typeof GetMyAccountsDtoSchema>;
