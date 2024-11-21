CREATE TABLE IF NOT EXISTS permissions (
    id         SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,

    name      VARCHAR(255) UNIQUE NOT NULL,
    essence   VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions (
    name ASC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_permissions_deleted_at ON permissions (
    deleted_at ASC NULLS LAST
);
