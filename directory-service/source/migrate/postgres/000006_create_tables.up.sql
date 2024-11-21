DROP TABLE IF EXISTS directory;
create table directory (
	id serial primary key,
	name VARCHAR (255) NOT NULL,
	parent_id INTEGER not null DEFAULT 0,
	author_id INTEGER not null DEFAULT 0,
	create_date timestamptz not null,
	update_date timestamptz not null,
	type_id SMALLINT not null DEFAULT 1,
	custom_order_id smallint not null DEFAULT 0,
	is_delete BOOLEAN not null DEFAULT false,
	spaceId INTEGER not null default 0
	);

CREATE INDEX idx_type_id ON directory(type_id);
CREATE INDEX idx_custom_order_id ON directory(custom_order_id);
CREATE INDEX idx_author_id ON directory(author_id);
CREATE INDEX idx_space_id ON directory(spaceId);
CREATE INDEX idx_parent_id ON directory(parent_id);

CREATE EXTENSION if not exists fuzzystrmatch;