-- AlterTable
ALTER TABLE "User" ADD COLUMN     "needDataVerification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedById" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
