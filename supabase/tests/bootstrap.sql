-- =============================================================================
-- Supabase-nabootsing voor de lokale testdatabase.
--
-- Alleen nodig wanneer de RLS-tests tegen PGlite draaien in plaats van tegen
-- een echt Supabase-project. Hier staat uitsluitend wat Supabase zelf al
-- meelevert: de rollen, het auth-schema en het storage-schema. De migrations
-- uit supabase/migrations draaien er daarna onveranderd overheen.
--
-- Let op: dit bootst Supabase na, het ís Supabase niet. De tests bewijzen dat
-- de policies doen wat ze horen te doen. Draai ze daarnaast één keer tegen het
-- echte project (SUPABASE_DB_URL) voordat je live gaat.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Rollen zoals Supabase ze aanmaakt
-- -----------------------------------------------------------------------------
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

grant usage on schema public to anon, authenticated, service_role;

-- Supabase geeft standaard alle rechten op nieuwe tabellen in `public`. RLS is
-- daar de poortwachter, niet het rechtenmodel. De migrations trekken die
-- rechten weer in waar dat nodig is; door hier hetzelfde te doen, testen we
-- tegen dezelfde uitgangssituatie als in productie.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- auth-schema
-- -----------------------------------------------------------------------------
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  instance_id uuid,
  id uuid primary key,
  aud text,
  role text,
  email text unique,
  encrypted_password text,
  email_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  raw_user_meta_data jsonb default '{}'::jsonb
);

-- De ingelogde gebruiker volgt uit de JWT-claims die de API-laag meestuurt.
create or replace function auth.uid() returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ),
    ''
  )::uuid;
$$;

create or replace function auth.role() returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  );
$$;

grant execute on function auth.uid, auth.role to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- storage-schema
-- -----------------------------------------------------------------------------
create schema storage;
grant usage on schema storage to anon, authenticated, service_role;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  created_at timestamptz not null default now()
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  created_at timestamptz not null default now(),
  metadata jsonb
);

alter table storage.objects enable row level security;

grant all on storage.buckets, storage.objects
  to anon, authenticated, service_role;

-- Levert de mappen in een pad: 'map/submap/bestand.mp4' -> {map,submap}
create or replace function storage.foldername(name text) returns text[]
language plpgsql
immutable
as $$
declare
  _parts text[];
begin
  _parts := string_to_array(name, '/');
  return _parts[1 : array_length(_parts, 1) - 1];
end;
$$;

grant execute on function storage.foldername to anon, authenticated, service_role;
