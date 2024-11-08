import { z } from 'zod';
import { CurrencyCodesEnum } from '@/shared/commonProjectParts';

export const StrategyTitleSchema = z.object({
  language: z.string(),
  title: z.string(),
});

export const InvestmentSchema = z.object({
  id: z.number(),
  estimatedShareValue: z.string().transform((value) => parseFloat(value)),
  estimatedShareValueEver: z.string().transform((value) => parseFloat(value)),
  profitability: z.number().nullable(),
  shareCost: z
    .string()
    .nullable()
    .transform((value) => (value ? BigInt(value) : null)),
  strategyCurrency: z.nativeEnum(CurrencyCodesEnum),
  strategyId: z.number(),
  strategyTitles: z.array(StrategyTitleSchema),
  totalInvestedAmount: z
    .string()
    .nullable()
    .transform((value) => (value ? BigInt(value) : null)),
  totalProfit: z
    .string()
    .nullable()
    .transform((value) => (value ? BigInt(value) : null)),
  totalShares: z.string().transform((value) => BigInt(value)),
});

export type InvestmentSchema = z.infer<typeof InvestmentSchema>;

export const GetInvestmentsDtoSchema = z.object({
  count: z.number(),
  take: z.number(),
  skip: z.number(),
  list: z.array(InvestmentSchema),
  pageIndex: z.number(),
});

export type GetInvestmentsDtoSchema = z.infer<typeof GetInvestmentsDtoSchema>;
