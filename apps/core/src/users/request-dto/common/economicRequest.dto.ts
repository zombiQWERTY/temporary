import { IsEnum, IsString } from 'class-validator';
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
  TradeFrequency,
} from '../../../../prisma/client';

export class Economic {
  @IsEnum(MarketExperience)
  marketExperience: MarketExperience;

  @IsEnum(InvestedInstruments, { each: true })
  investedInstruments: InvestedInstruments[];

  @IsEnum(EducationLevel)
  educationLevel: EducationLevel;

  @IsEnum(InvestmentGoals)
  investmentGoals: InvestmentGoals;

  @IsEnum(InvestmentDuration)
  investmentDuration: InvestmentDuration;

  @IsEnum(TradeFrequency)
  tradeFrequency: TradeFrequency;

  @IsEnum(InvestmentRanges)
  initialInvestment: InvestmentRanges;

  @IsEnum(InvestmentRanges)
  expectedTurnover: InvestmentRanges;

  @IsEnum(InvestmentRanges)
  annualIncome: InvestmentRanges;

  @IsEnum(InvestmentRanges)
  totalAssetValue: InvestmentRanges;

  @IsEnum(SourceOfFunds, { each: true })
  sourceOfFunds: SourceOfFunds[];

  @IsString()
  employerNameAddress: string;

  @IsEnum(IndustrySector)
  industrySector: IndustrySector;

  @IsEnum(PositionHeld)
  positionHeld: PositionHeld;

  @IsString()
  fundTransferOrigin: string;

  @IsString()
  expectedTransferDestination: string;

  @IsEnum(PoliticallyExposed)
  politicallyExposed: PoliticallyExposed;

  @IsEnum(Dependants)
  dependants: Dependants;
}
