CREATE TABLE IF NOT EXISTS spaces (
    id         SERIAL NOT NULL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,

    project_id   INT NOT NULL,
    creator      INT NOT NULL,
    custom_order INT NOT NULL,
    name         VARCHAR(100) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON UPDATE CASCADE,
    UNIQUE (project_id, name)
);
