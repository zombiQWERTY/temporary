CREATE TABLE IF NOT EXISTS steps (
    id         SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,

    creator       INT NOT NULL,
    content         VARCHAR(1024) NOT NULL,
    custom_order  INT NOT NULL,

    step_group       INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_creator ON steps (
                                                         creator ASC NULLS LAST
);

CREATE INDEX IF NOT EXISTS idx_cases_deleted_at ON steps (
                                                         deleted_at ASC NULLS LAST
);
