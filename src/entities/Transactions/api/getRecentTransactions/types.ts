import { parseISO } from 'date-fns';
import { z } from 'zod';
import {
  OperationStatusEnum,
  OperationSubTypeEnum,
  OperationTypeEnum,
} from '@/entities/Transactions';
import {
  CurrencyCodesEnum,
  AccountTypeEnum,
} from '@/shared/commonProjectParts';

export const TransactionSchema = z.object({
  id: z.number(),
  subAccountId: z.number(),
  branchId: z.number(),
  operationType: z.nativeEnum(OperationTypeEnum),
  operationSubType: z.nativeEnum(OperationSubTypeEnum),
  operationStatus: z.nativeEnum(OperationStatusEnum),
  amount: z.string().transform(BigInt),
  isConfirmed: z.boolean(),
  confirmationDate: z
    .string()
    .nullable()
    .transform((val) => (val ? parseISO(val) : null)),
  confirmedBy: z.number().nullable(),
  transferTo: z.number().nullable(),
  transferFrom: z.number().nullable(),
  paymentMethodUsed: z.object({}).passthrough(),
  receiptId: z.string().nullable(),
  comment: z.string().nullable(),

  subAccount: z.object({
    id: z.number(),
    account: z.object({
      id: z.number(),
      accountType: z.nativeEnum(AccountTypeEnum),
      walletNumber: z.object({
        walletId: z.string(),
      }),
    }),
    currencyCode: z.nativeEnum(CurrencyCodesEnum),
  }),

  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export type TransactionSchema = z.infer<typeof TransactionSchema>;

export const GetRecentTransactionsDtoSchema = z.object({
  count: z.number(),
  take: z.number(),
  skip: z.number(),
  list: z.array(TransactionSchema),
  pageIndex: z.number(),
});

export type GetRecentTransactionsDtoSchema = z.infer<
  typeof GetRecentTransactionsDtoSchema
>;
