-- CreateTable
CREATE TABLE "UserAccountSettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "accountOperationsBlocked" BOOLEAN NOT NULL DEFAULT false,
    "limitInUsd" BIGINT NOT NULL DEFAULT 2500000,

    CONSTRAINT "UserAccountSettings_pkey" PRIMARY KEY ("id")
);
