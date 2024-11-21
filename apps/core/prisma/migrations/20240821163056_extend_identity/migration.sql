/*
  Warnings:

  - The values [Identity] on the enum `DocumentTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentTypeEnum_new" AS ENUM ('IdentityFirstPack', 'IdentitySecondPack', 'Location', 'Economic', 'Taxes', 'Other', 'ApplicationFormForNaturalPersons');
ALTER TABLE "Document" ALTER COLUMN "type" TYPE "DocumentTypeEnum_new" USING ("type"::text::"DocumentTypeEnum_new");
ALTER TYPE "DocumentTypeEnum" RENAME TO "DocumentTypeEnum_old";
ALTER TYPE "DocumentTypeEnum_new" RENAME TO "DocumentTypeEnum";
DROP TYPE "DocumentTypeEnum_old";
COMMIT;
