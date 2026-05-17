DROP DATABASE IF EXISTS sportnipartner;
DROP ROLE IF EXISTS sportni_user;

CREATE ROLE sportni_user LOGIN PASSWORD 'sportni123';

CREATE DATABASE sportnipartner OWNER sportni_user;

GRANT CONNECT ON DATABASE sportnipartner TO sportni_user;
GRANT ALL PRIVILEGES ON DATABASE sportnipartner TO sportni_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sportni_user;

SELECT * FROM pg_roles WHERE rolname = 'sportni_user';
SELECT * FROM pg_database WHERE datname = 'sportnipartner';