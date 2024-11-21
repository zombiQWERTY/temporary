CREATE TABLE IF NOT EXISTS user_has_starred (
    id       SERIAL NOT NULL PRIMARY KEY,
    space_id INT REFERENCES spaces (id) ON UPDATE CASCADE,
    project_id INT REFERENCES projects (id) ON UPDATE CASCADE,
    user_id INT NOT NULL
);
