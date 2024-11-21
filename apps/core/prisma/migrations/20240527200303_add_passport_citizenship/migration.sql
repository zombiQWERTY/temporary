/*
  Warnings:

  - Added the required column `citizenshipCountryCode` to the `Passport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Passport" ADD COLUMN     "citizenshipCountryCode" TEXT NOT NULL;
