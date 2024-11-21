-- CreateEnum
CREATE TYPE "USTaxResident" AS ENUM ('No', 'Yes');

-- CreateEnum
CREATE TYPE "SourceOfInfo" AS ENUM ('FromOnlineAdvertisements', 'FromSocialMedia', 'FromOutdoorAdvertisements', 'FromPersonalAdvertisementAdvisor', 'FromSupportDepartment', 'FromEmailNewsletters', 'FromFriends', 'IDoNotRemember');

-- CreateTable
CREATE TABLE "TaxPayerProfile" (
    "id" SERIAL NOT NULL,
    "individualTaxpayerNumber" TEXT NOT NULL,
    "isUSTaxResident" "USTaxResident" NOT NULL,
    "howDidYouHearAboutUs" "SourceOfInfo" NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "TaxPayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayerProfile_individualTaxpayerNumber_key" ON "TaxPayerProfile"("individualTaxpayerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayerProfile_userId_key" ON "TaxPayerProfile"("userId");

-- AddForeignKey
ALTER TABLE "TaxPayerProfile" ADD CONSTRAINT "TaxPayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
