BEGIN;

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
            create type status AS ENUM ('ready', 'draft', 'archived', 'broken');
        END IF;
    END
$$;

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
            create type priority AS ENUM ('low', 'medium', 'high');
        END IF;
    END
$$;

CREATE TABLE IF NOT EXISTS cases (
    id         SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,

    creator       INT NOT NULL,
    title         VARCHAR(100) NOT NULL,
    custom_order  INT NOT NULL,
    custom_id     VARCHAR(64) NOT NULL,
    description   VARCHAR(2024),
    preconditions VARCHAR(2024),

    status   status,
    priority priority,

    project       INT NOT NULL,
    space         INT NOT NULL,
    folder        INT
);

CREATE INDEX IF NOT EXISTS idx_cases_creator ON cases (
                                                         creator ASC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_cases_deleted_at ON cases (
                                                         deleted_at ASC NULLS LAST
);

COMMIT;
