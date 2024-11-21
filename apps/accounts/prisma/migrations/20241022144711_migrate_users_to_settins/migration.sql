DO $$
DECLARE
    account RECORD;
    settingsId INT;
BEGIN
    FOR account IN SELECT DISTINCT "ownerId" FROM "Account" WHERE "ownerId" IS NOT NULL LOOP
        -- Check if UserAccountSettings already exists for the ownerId (userId)
        SELECT id INTO settingsId
        FROM "UserAccountSettings"
        WHERE "userId" = account."ownerId";

        -- If not found, insert a new UserAccountSettings entry
        IF settingsId IS NULL THEN
            INSERT INTO "UserAccountSettings" ("userId")
            VALUES (account."ownerId")
            RETURNING id INTO settingsId;
        END IF;
    END LOOP;
END $$;
