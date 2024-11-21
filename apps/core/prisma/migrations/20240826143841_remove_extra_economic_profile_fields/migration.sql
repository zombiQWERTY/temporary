/*
  Warnings:

  - You are about to drop the column `economicStatus` on the `EconomicProfile` table. All the data in the column will be lost.
  - You are about to drop the column `usaResident` on the `EconomicProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EconomicProfile" DROP COLUMN "economicStatus",
DROP COLUMN "usaResident";

-- DropEnum
DROP TYPE "EconomicStatus";
