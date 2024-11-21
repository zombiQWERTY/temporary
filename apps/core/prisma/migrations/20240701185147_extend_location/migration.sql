/*
  Warnings:

  - You are about to drop the column `address` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `Location` table. All the data in the column will be lost.
  - Added the required column `countryOfResidenceCode` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flatNo` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streetNo` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "location_idx_country_city";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "address",
DROP COLUMN "countryCode",
ADD COLUMN     "countryOfResidenceCode" TEXT NOT NULL,
ADD COLUMN     "flatNo" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "streetNo" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "location_idx_country_city" ON "Location"("countryOfResidenceCode", "city");
