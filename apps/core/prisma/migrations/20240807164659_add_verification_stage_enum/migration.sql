-- CreateEnum
CREATE TYPE "VerificationStageEnum" AS ENUM ('Passport', 'Residence', 'Economic', 'Taxpayer', 'Contract');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationStage" "VerificationStageEnum" NOT NULL DEFAULT 'Passport';
