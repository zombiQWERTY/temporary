/*
  Warnings:

  - You are about to drop the column `walletId` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "walletId";

-- CreateTable
CREATE TABLE "WalletNumber" (
    "id" SERIAL NOT NULL,
    "walletId" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "WalletNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletNumber_walletId_key" ON "WalletNumber"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletNumber_accountId_key" ON "WalletNumber"("accountId");

-- AddForeignKey
ALTER TABLE "WalletNumber" ADD CONSTRAINT "WalletNumber_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
