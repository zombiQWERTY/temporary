-- CreateEnum
CREATE TYPE "EconomicStatus" AS ENUM ('Student', 'Entrepreneur', 'Unemployed');

-- CreateEnum
CREATE TYPE "PoliticallyExposed" AS ENUM ('NoNotLinked', 'YesLinked');

-- CreateEnum
CREATE TYPE "MarketExperience" AS ENUM ('MoreThanFiveYears', 'TwoToFiveYears', 'LessThanTwoYears', 'NoExperience');

-- CreateEnum
CREATE TYPE "InvestedInstruments" AS ENUM ('StocksBonds', 'OptionsFutures', 'AllTypes', 'NotDecided');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('SecondarySchool', 'HighSchool', 'Professional', 'Academic');

-- CreateEnum
CREATE TYPE "InvestmentGoals" AS ENUM ('CapitalSaving', 'CapitalGain', 'ActiveTrading', 'NotDecided');

-- CreateEnum
CREATE TYPE "InvestmentDuration" AS ENUM ('DayTrading', 'LessThanAYear', 'MoreThanAYear');

-- CreateEnum
CREATE TYPE "TradeFrequency" AS ENUM ('OneToFifty', 'FiftyToOneHundred', 'MoreThanOneHundred');

-- CreateEnum
CREATE TYPE "InvestmentRanges" AS ENUM ('LessThan25K', 'Range25K100K', 'Range100K300K', 'Range300K1M', 'Range1M10M', 'Range10M30M');

-- CreateEnum
CREATE TYPE "SourceOfFunds" AS ENUM ('Wage', 'Savings', 'Inheritance', 'Investments');

-- CreateEnum
CREATE TYPE "IndustrySector" AS ENUM ('Construction', 'Financials', 'CasinoBettingLottery', 'LargeCashTurnoverBusiness', 'NonProfit', 'WeaponsDefence', 'FundBroker', 'NotOneOfAbove');

-- CreateEnum
CREATE TYPE "PositionHeld" AS ENUM ('KeyStaff', 'MiddleLink', 'Student', 'SelfEmployed', 'Unemployed');

-- CreateEnum
CREATE TYPE "Dependants" AS ENUM ('None', 'One', 'TwoOrMore');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentTypeEnum" ADD VALUE 'Economic';
ALTER TYPE "DocumentTypeEnum" ADD VALUE 'Taxes';
ALTER TYPE "DocumentTypeEnum" ADD VALUE 'Other';

-- AlterTable
ALTER TABLE "UserSourceTracking" ADD COLUMN     "branchId" INTEGER,
ADD COLUMN     "countryCode" VARCHAR(255),
ADD COLUMN     "lang" VARCHAR(255);

-- CreateTable
CREATE TABLE "EconomicProfile" (
    "id" SERIAL NOT NULL,
    "economicStatus" "EconomicStatus"[],
    "marketExperience" "MarketExperience" NOT NULL,
    "investedInstruments" "InvestedInstruments"[],
    "educationLevel" "EducationLevel" NOT NULL,
    "investmentGoals" "InvestmentGoals" NOT NULL,
    "investmentDuration" "InvestmentDuration" NOT NULL,
    "tradeFrequency" "TradeFrequency" NOT NULL,
    "initialInvestment" "InvestmentRanges" NOT NULL,
    "expectedTurnover" "InvestmentRanges" NOT NULL,
    "annualIncome" "InvestmentRanges" NOT NULL,
    "totalAssetValue" "InvestmentRanges" NOT NULL,
    "sourceOfFunds" "SourceOfFunds"[],
    "employerNameAddress" TEXT,
    "industrySector" "IndustrySector" NOT NULL,
    "positionHeld" "PositionHeld" NOT NULL,
    "fundTransferOrigin" TEXT NOT NULL,
    "expectedTransferDestination" TEXT NOT NULL,
    "politicallyExposed" "PoliticallyExposed" NOT NULL,
    "dependants" "Dependants" NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "EconomicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EconomicProfile_userId_key" ON "EconomicProfile"("userId");

-- AddForeignKey
ALTER TABLE "EconomicProfile" ADD CONSTRAINT "EconomicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
