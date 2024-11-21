/*
  Warnings:

  - You are about to alter the column `value` on the `Rate` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.

*/
-- AlterTable
ALTER TABLE "Rate" ALTER COLUMN "value" SET DATA TYPE DECIMAL(20,8);
