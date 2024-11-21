-- CreateEnum
CREATE TYPE "AccountTypeEnum" AS ENUM ('Master', 'Savings');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "accountType" "AccountTypeEnum" NOT NULL DEFAULT 'Master';
