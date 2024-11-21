-- CreateEnum
CREATE TYPE "OperationTypeEnum" AS ENUM ('Deposit', 'Withdrawal');

-- CreateEnum
CREATE TYPE "OperationSubTypeEnum" AS ENUM ('ExternalDeposit', 'ExternalWithdrawal', 'InternalTransfer', 'ServiceInternalTransfer', 'PeerToPeerTransfer');

-- CreateEnum
CREATE TYPE "OperationStatusEnum" AS ENUM ('Pending', 'Completed', 'Failed');

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "walletId" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubAccount" (
    "id" SERIAL NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,

    CONSTRAINT "SubAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "subAccountId" INTEGER NOT NULL,
    "operationType" "OperationTypeEnum" NOT NULL,
    "operationSubType" "OperationSubTypeEnum" NOT NULL,
    "operationStatus" "OperationStatusEnum" NOT NULL,
    "amount" INTEGER NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationDate" TIMESTAMP(3),
    "confirmedBy" INTEGER,
    "transferTo" INTEGER,
    "transferFrom" INTEGER,
    "paymentMethodUsed" JSONB NOT NULL,
    "receiptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubAccount" ADD CONSTRAINT "SubAccount_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubAccount" ADD CONSTRAINT "SubAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
