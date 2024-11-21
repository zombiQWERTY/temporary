/*
  Warnings:

  - You are about to drop the column `countryCode` on the `Branch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "countryCode";

-- CreateTable
CREATE TABLE "BranchesOnCountry" (
    "branchId" INTEGER NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,

    CONSTRAINT "BranchesOnCountry_pkey" PRIMARY KEY ("branchId","countryCode")
);

-- AddForeignKey
ALTER TABLE "BranchesOnCountry" ADD CONSTRAINT "BranchesOnCountry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
