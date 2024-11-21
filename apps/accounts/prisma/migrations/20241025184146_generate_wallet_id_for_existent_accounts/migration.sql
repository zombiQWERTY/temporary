-- Migrate existing accounts by creating WalletNumber entries for each existing account
DO $$
DECLARE
    account_record RECORD;
    new_wallet_id VARCHAR(10);
BEGIN
    FOR account_record IN SELECT * FROM "Account" LOOP
        LOOP
            new_wallet_id := 'M' || lpad(floor(random() * 10000000)::TEXT, 7, '0');
            -- Check if the generated walletId is unique
            EXIT WHEN NOT EXISTS (SELECT 1 FROM "WalletNumber" WHERE "walletId" = new_wallet_id);
        END LOOP;
        INSERT INTO "WalletNumber" ("walletId", "accountId") VALUES (new_wallet_id, account_record."id");
    END LOOP;
END $$;
