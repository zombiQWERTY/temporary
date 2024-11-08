import { parseISO } from 'date-fns';
import { z } from 'zod';

import { onlyEnLettersTextSchema } from '@/shared/api/resolvers';
import { RoleWrappedSchema } from '@/shared/auth';
import {
  Dependants,
  EducationLevel,
  IndustrySector,
  InvestedInstruments,
  InvestmentDuration,
  InvestmentGoals,
  InvestmentRanges,
  MarketExperience,
  PoliticallyExposed,
  PositionHeld,
  SourceOfFunds,
  SourceOfInfo,
  TradeFrequency,
  UsaResident,
} from './profileEnums';
import { AccountStatusEnum, VerificationStageEnum } from './types';

export const AuthDtoSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  emailConfirmed: z.boolean(),
  emailConfirmedAt: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  phone: z.string(),
  phoneConfirmed: z.boolean(),
  phoneConfirmedAt: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  roles: z.array(RoleWrappedSchema),
  userId: z.number(),

  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export const BranchDtoSchema = z.object({
  branch: z.object({
    id: z.number(),
    address: z.string().nullable(),
    branchName: z.string(),
    email: z.string().nullable(),
    phoneNumber: z.string().nullable(),
  }),
  branchId: z.number(),
  isHeadOfBranch: z.boolean(),
  userId: z.number(),
  userRole: z.string(),
});

export const DocumentDtoSchema = z.object({
  fileId: z.number(),
  type: z.string(),
});

export const EconomicProfileDtoSchema = z.object({
  id: z.number(),
  marketExperience: z.nativeEnum(MarketExperience),
  investedInstruments: z.array(z.nativeEnum(InvestedInstruments)).min(1),
  educationLevel: z.nativeEnum(EducationLevel),
  investmentGoals: z.nativeEnum(InvestmentGoals),
  investmentDuration: z.nativeEnum(InvestmentDuration),
  tradeFrequency: z.nativeEnum(TradeFrequency),
  initialInvestment: z.nativeEnum(InvestmentRanges),
  expectedTurnover: z.nativeEnum(InvestmentRanges),
  annualIncome: z.nativeEnum(InvestmentRanges),
  totalAssetValue: z.nativeEnum(InvestmentRanges),
  sourceOfFunds: z.array(z.nativeEnum(SourceOfFunds)).min(1),
  employerNameAddress: onlyEnLettersTextSchema.min(1),
  industrySector: z.nativeEnum(IndustrySector),
  positionHeld: z.nativeEnum(PositionHeld),
  politicallyExposed: z.nativeEnum(PoliticallyExposed),
  dependants: z.nativeEnum(Dependants),
  expectedTransferDestination: z.string(),
  fundTransferOrigin: z.string(),
  userId: z.number(),
});

// @TODO: divide DTO and Args schemas here and above this file
export const LocationDtoSchema = z.object({
  id: z.number(),
  city: onlyEnLettersTextSchema,
  countryOfResidenceCode: z.string(),
  flatNo: onlyEnLettersTextSchema,
  region: onlyEnLettersTextSchema,
  street: onlyEnLettersTextSchema,
  streetNo: onlyEnLettersTextSchema,
  userId: z.number(),
  zipCode: onlyEnLettersTextSchema,
});

export const PassportDtoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  authority: z.string(),
  authorityDate: z.string().transform((arg) => parseISO(arg)),
  citizenshipCountryCode: z.string(),
  documentNumber: z.string(),
  expiryAt: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  noExpirationDate: z.boolean(),
  originCountryCode: z.string(),
  placeOfBirth: z.string(),
});

export const TaxPayerProfileDtoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  individualTaxpayerNumber: onlyEnLettersTextSchema,
  taxResidency: z.string(),
  isUSTaxResident: z.nativeEnum(UsaResident),
  howDidYouHearAboutUs: z.nativeEnum(SourceOfInfo),
});

export const ProfileDtoSchema = z.object({
  id: z.number(),
  auth: AuthDtoSchema,
  accountStatus: z.nativeEnum(AccountStatusEnum),
  agreedToApplicationTerms: z.boolean(),
  agreedToApplicationTermsDate: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  agreedToClaimsRegistrationRules: z.boolean(),
  agreedToClaimsRegistrationRulesDate: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  agreedToMarginTradesRules: z.boolean(),
  agreedToMarginTradesRulesDate: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  agreedToServiceGeneralRules: z.boolean(),
  agreedToServiceGeneralRulesDate: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  birthdate: z
    .string()
    .nullable()
    .transform((arg) => (arg ? parseISO(arg) : null)),
  branches: z.array(BranchDtoSchema),
  countryCode: z.string().nullable(),
  createdById: z.number().nullable(),
  documents: z.array(DocumentDtoSchema),
  economicProfile: EconomicProfileDtoSchema.nullable(),
  firstName: z.string().nullable(),
  lang: z.string().nullable(),
  lastName: z.string().nullable(),
  location: LocationDtoSchema.nullable(),
  mainBranchId: z.number().nullable(),
  mainRole: z.string(),
  managerId: z.number().nullable(),
  middleName: z.string().nullable(),
  needDataVerification: z.boolean(),
  passport: PassportDtoSchema.nullable(),
  taxPayerProfile: TaxPayerProfileDtoSchema.nullable(),
  verificationFailedReason: z.string().nullable(),
  verificationStage: z.nativeEnum(VerificationStageEnum),
  verifiedById: z.number().nullable(),
  workPhone: z.string().nullable(),

  createdAt: z.string().transform((arg) => parseISO(arg)),
  updatedAt: z.string().transform((arg) => parseISO(arg)),
});

export type ProfileDtoSchema = z.infer<typeof ProfileDtoSchema>;
