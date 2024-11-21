/*
  Warnings:

  - Added the required column `taxResidency` to the `TaxPayerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaxPayerProfile" ADD COLUMN     "taxResidency" TEXT NOT NULL;
