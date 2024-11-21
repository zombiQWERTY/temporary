DROP TABLE IF EXISTS essence;
DROP TABLE IF EXISTS directory;
create table directory (
	id serial primary key,
	name VARCHAR (255) NOT NULL,
	parent_id INTEGER,
	author_id INTEGER not null,
	create_date timestamptz,
	update_date timestamptz,
	type_id SMALLINT DEFAULT 1,
	custom_order_id smallint,
	is_delete BOOLEAN not null DEFAULT false
	);

CREATE INDEX idx_update_date
ON directory(update_date);
CREATE INDEX idx_type_id
ON directory(type_id);
CREATE INDEX idx_custom_order_id
ON directory(custom_order_id);
CREATE INDEX idx_author_id
ON directory(author_id);


create table essence (
	id serial primary key,
	directory_id integer not null,
	ess_id INTEGER not null,
	type_ess_id INTEGER not null,
	is_delete BOOLEAN not null DEFAULT FALSE
	);

ALTER TABLE essence ADD CONSTRAINT essence_id_directory_id_fkey FOREIGN KEY (directory_id)
      REFERENCES directory (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO action;

CREATE INDEX idx_directory_id
ON essence(directory_id);
