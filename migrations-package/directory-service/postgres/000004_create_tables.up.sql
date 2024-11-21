alter table directory ADD COLUMN spaceId INTEGER not null default 0;
CREATE INDEX idx_space_id ON directory (spaceId);