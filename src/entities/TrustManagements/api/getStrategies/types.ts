import { parseISO } from 'date-fns';
import { z } from 'zod';
import { CurrencyCodesEnum } from '@/shared/commonProjectParts';

export const StrategyProfileSchema = z.object({
  id: z.number(),
  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),

  language: z.string().length(2),
  strategyName: z.string(),
  strategyDescription: z.string(),
  strategyDetails: z.string(),
  strategyId: z.number(),
  faq: z.array(
    z.object({
      title: z.string(),
      text: z.string(),
    }),
  ),
  portfolioInstruments: z.array(
    z.object({
      color: z.string(),
      name: z.string(),
    }),
  ),
  riskManagement: z.array(
    z.object({
      title: z.string(),
      text: z.string(),
    }),
  ),
  strategyAdvantages: z.array(
    z.object({
      title: z.string(),
      text: z.string(),
    }),
  ),
});

export const StrategyShareSchema = z.object({
  id: z.number(),
  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),

  cost: z.string().transform((value) => parseInt(value, 10)),
  strategyId: z.number(),
  totalAmount: z.string().transform((value) => parseInt(value, 10)),
});

export const StrategySchema = z.object({
  id: z.number(),
  accountId: z.number(),
  advertisedInvestorCount: z.number(),
  advertisedManagedAmount: z.string().transform(BigInt),
  annualReturn: z.array(
    z.object({
      return: z.number(),
      year: z.number(),
    }),
  ),
  annualReturnParam: z.string().transform((value) => parseFloat(value)),
  averageReturn: z.string().transform((value) => parseFloat(value)),
  baseCurrency: z.nativeEnum(CurrencyCodesEnum),
  enabled: z.boolean(),
  investorCount: z.number(),
  managedAmount: z.string().transform((value) => parseInt(value, 10)),
  managerCommission: z.string().transform((value) => parseFloat(value)),
  maxDrawdown: z.string().transform((value) => parseFloat(value)),
  minInvestmentAmount: z.string().transform((value) => parseInt(value, 10)),
  monthlyDrawdown: z.array(
    z.object({
      month: z.number().min(1).max(12),
      return: z.number(),
      year: z.number(),
    }),
  ),
  monthlyReturn: z.array(
    z.object({
      month: z.number().min(1).max(12),
      return: z.number(),
      year: z.number(),
    }),
  ),
  profiles: z.array(StrategyProfileSchema),
  returnToMaxDrawdown: z.string().transform((value) => parseFloat(value)),
  shares: z.array(StrategyShareSchema),
  sharpeRatio: z.string().transform((value) => parseFloat(value)),
  strategyEndDate: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  strategyStartDate: z.string().transform((arg) => parseISO(arg)),
  trusteeId: z.number(),

  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export type StrategySchema = z.infer<typeof StrategySchema>;

export const GetStrategiesDtoSchema = z.object({
  count: z.number(),
  take: z.number(),
  skip: z.number(),
  list: z.array(StrategySchema),
  pageIndex: z.number(),
});

export type GetStrategiesDtoSchema = z.infer<typeof GetStrategiesDtoSchema>;
