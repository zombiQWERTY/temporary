/*
  Warnings:

  - Added the required column `usaResident` to the `EconomicProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UsaResident" AS ENUM ('No', 'Yes');

-- AlterEnum
ALTER TYPE "DocumentTypeEnum" ADD VALUE 'ApplicationFormForNaturalPersons';

-- AlterTable
ALTER TABLE "EconomicProfile" ADD COLUMN     "usaResident" "UsaResident" NOT NULL;
