CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Immutable wrapper for unaccent (required for generated columns and indexes)
CREATE OR REPLACE FUNCTION f_unaccent(text)
RETURNS text AS $$
  SELECT public.unaccent('public.unaccent', $1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
