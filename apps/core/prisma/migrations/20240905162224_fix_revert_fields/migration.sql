/*
  Warnings:

  - You are about to drop the column `number` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `series` on the `Passport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Passport" DROP COLUMN "number",
DROP COLUMN "series";
