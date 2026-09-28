-- Run this once as a PostgreSQL admin/superuser, replacing the role if needed.
create schema if not exists embed authorization dev_campaigner;

grant usage, create on schema embed to dev_campaigner;
grant all privileges on all tables in schema embed to dev_campaigner;
grant all privileges on all sequences in schema embed to dev_campaigner;

alter default privileges in schema embed
grant all privileges on tables to dev_campaigner;

alter default privileges in schema embed
grant all privileges on sequences to dev_campaigner;
