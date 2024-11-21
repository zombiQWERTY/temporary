CREATE TABLE IF NOT EXISTS user_has_permissions (
    id            SERIAL NOT NULL PRIMARY KEY,
    permission_id INT NOT NULL REFERENCES permissions (id) ON UPDATE CASCADE,
    user_id INT NOT NULL REFERENCES users (id) ON UPDATE CASCADE,
    model_id INT
);
