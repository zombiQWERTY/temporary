-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agreedToApplicationTerms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreedToApplicationTermsDate" TIMESTAMP(3),
ADD COLUMN     "agreedToClaimsRegistrationRules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreedToClaimsRegistrationRulesDate" TIMESTAMP(3),
ADD COLUMN     "agreedToMarginTradesRules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreedToMarginTradesRulesDate" TIMESTAMP(3),
ADD COLUMN     "agreedToServiceGeneralRules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agreedToServiceGeneralRulesDate" TIMESTAMP(3);
