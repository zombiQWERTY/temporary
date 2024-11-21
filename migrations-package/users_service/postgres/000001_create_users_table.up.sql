BEGIN;

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
            create type user_status AS ENUM ('invited', 'active', 'blocked', 'removed');
        END IF;
    END
$$;

CREATE TABLE IF NOT EXISTS users (
    id         SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,

    email      VARCHAR(100) UNIQUE NOT NULL,
    phone      VARCHAR(32),
    first_name VARCHAR(64),
    last_name  VARCHAR(64),
    short_name VARCHAR(64) UNIQUE,
    other_info VARCHAR(500),
    status user_status,

    password VARCHAR(1024),
    salt VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_short_user_name ON users (
    short_name ASC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (
    deleted_at ASC NULLS LAST
);

COMMIT;
