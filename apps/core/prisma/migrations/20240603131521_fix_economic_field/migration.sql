/*
  Warnings:

  - Made the column `employerNameAddress` on table `EconomicProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EconomicProfile" ALTER COLUMN "employerNameAddress" SET NOT NULL;
