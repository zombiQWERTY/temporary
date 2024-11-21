CREATE TABLE IF NOT EXISTS tenants (
    id         SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,

    name      VARCHAR(62) NOT NULL,
    domain    VARCHAR(62) UNIQUE NOT NULL
);

CREATE INDEX idx_short_user_name ON tenants (
    name ASC NULLS LAST
);

CREATE INDEX idx_users_deleted_at ON tenants (
    deleted_at ASC NULLS LAST
);
