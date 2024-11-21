/*
  Warnings:

  - Added the required column `noExpirationDate` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCountryCode` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeOfBirth` to the `Passport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Passport" ADD COLUMN     "expiryAt" TIMESTAMP(3),
ADD COLUMN     "noExpirationDate" BOOLEAN NOT NULL,
ADD COLUMN     "originCountryCode" TEXT NOT NULL,
ADD COLUMN     "placeOfBirth" TEXT NOT NULL;
