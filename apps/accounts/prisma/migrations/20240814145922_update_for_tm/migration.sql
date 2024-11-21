-- AlterEnum
ALTER TYPE "AccountTypeEnum" ADD VALUE 'TM';

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "extra" JSONB NOT NULL DEFAULT '{}';
