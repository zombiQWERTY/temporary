-- AlterEnum
ALTER TYPE "OperationSubTypeEnum" ADD VALUE 'InternalChange';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "comment" TEXT;
