CREATE TABLE IF NOT EXISTS step_groups (
    id         SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,

    creator       INT NOT NULL,
    result         VARCHAR(1024) NOT NULL,
    custom_order  INT NOT NULL,

    "case"       INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_creator ON step_groups (
                                                         creator ASC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_cases_deleted_at ON step_groups (
                                                         deleted_at ASC NULLS LAST
);
