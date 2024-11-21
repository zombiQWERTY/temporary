-- CreateTable
CREATE TABLE "UserSourceTracking" (
    "utmSource" VARCHAR(255),
    "utmMedium" VARCHAR(255),
    "utmCampaign" VARCHAR(255),
    "utmContent" VARCHAR(255),
    "utmTerm" VARCHAR(255),
    "userAgent" VARCHAR(255),
    "ipAddress" VARCHAR(255),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSourceTracking_userId_key" ON "UserSourceTracking"("userId");

-- CreateIndex
CREATE INDEX "tracking_idx_user_id" ON "UserSourceTracking"("userId");

-- CreateIndex
CREATE INDEX "auth_idx_user_id" ON "Auth"("userId");

-- CreateIndex
CREATE INDEX "document_idx_user_id_type" ON "Document"("userId", "type");

-- CreateIndex
CREATE INDEX "location_idx_country_city" ON "Location"("countryCode", "city");

-- CreateIndex
CREATE INDEX "roles_on_auth_idx_role_id" ON "RolesOnAuth"("roleId");

-- CreateIndex
CREATE INDEX "roles_on_auth_idx_auth_id" ON "RolesOnAuth"("authId");

-- CreateIndex
CREATE INDEX "user_idx_account_status" ON "User"("accountStatus");

-- CreateIndex
CREATE INDEX "user_idx_country_code" ON "User"("countryCode");

-- AddForeignKey
ALTER TABLE "UserSourceTracking" ADD CONSTRAINT "UserSourceTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
