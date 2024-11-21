/*
  Warnings:

  - The primary key for the `Passport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `number` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `series` on the `Passport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentNumber]` on the table `Passport` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Passport" DROP CONSTRAINT "Passport_pkey",
DROP COLUMN "number",
DROP COLUMN "series",
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Passport_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_documentNumber_key" ON "Passport"("documentNumber");
