/*
  Warnings:

  - Added the required column `branchId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "branchId" INTEGER NOT NULL;
