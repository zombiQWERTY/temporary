import { parseISO } from 'date-fns';
import { z } from 'zod';
import { CurrencyCodesEnum } from '@/shared/commonProjectParts';

const AnnualReturnSchema = z.object({
  return: z.number(),
  year: z.number(),
});

const MonthlyReturnSchema = z.object({
  month: z.number(),
  return: z.number(),
  year: z.number(),
});

const FAQSchema = z.object({
  text: z.string(),
  title: z.string(),
});

const PortfolioInstrumentSchema = z.object({
  color: z.string(),
  name: z.string(),
});

const RiskManagementSchema = z.object({
  text: z.string(),
  title: z.string(),
});

const StrategyAdvantageSchema = z.object({
  text: z.string(),
  title: z.string(),
});

const ProfileSchema = z.object({
  id: z.number(),

  faq: z.array(FAQSchema),
  language: z.string(),
  portfolioInstruments: z.array(PortfolioInstrumentSchema),
  riskManagement: z.array(RiskManagementSchema),
  strategyAdvantages: z.array(StrategyAdvantageSchema),
  strategyDescription: z.string(),
  strategyDetails: z.string(),

  strategyId: z.number(),
  strategyName: z.string(),

  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

const ShareSchema = z.object({
  id: z.number(),

  cost: z.string().transform((value) => parseInt(value, 10)),
  strategyId: z.number(),
  totalAmount: z.string().transform((value) => parseInt(value, 10)),

  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export const StrategySchema = z.object({
  id: z.number(),
  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),

  accountId: z.number(),
  advertisedInvestorCount: z.number(),
  advertisedManagedAmount: z.string().transform(BigInt),
  annualReturn: z.array(AnnualReturnSchema),
  annualReturnParam: z.string().transform((value) => parseFloat(value)),
  averageReturn: z.string().transform((value) => parseFloat(value)),
  baseCurrency: z.nativeEnum(CurrencyCodesEnum),
  enabled: z.boolean(),
  investorCount: z.number(),
  managedAmount: z.string().transform((value) => parseInt(value, 10)),
  managerCommission: z.string().transform((value) => parseFloat(value)),
  maxDrawdown: z.string().transform((value) => parseFloat(value)),
  minInvestmentAmount: z.string().transform((value) => parseInt(value, 10)),
  monthlyDrawdown: z.array(MonthlyReturnSchema),
  monthlyReturn: z.array(MonthlyReturnSchema),
  profiles: z.array(ProfileSchema),
  returnToMaxDrawdown: z.string().transform((value) => parseFloat(value)),
  shares: z.array(ShareSchema),
  sharpeRatio: z.string().transform((value) => parseFloat(value)),
  strategyStartDate: z.string().transform((arg) => parseISO(arg)),
  strategyEndDate: z.nullable(
    z.string().transform((arg) => (arg ? parseISO(arg) : null)),
  ),
  trusteeId: z.number(),
});

export type StrategySchema = z.infer<typeof StrategySchema>;

export const GetStrategyByIdDtoSchema = z.object({
  strategy: StrategySchema,
});

export type GetStrategyByIdDtoSchema = z.infer<typeof GetStrategyByIdDtoSchema>;
