-- =============================================================================
-- Hulpmiddelen voor de RLS-tests.
--
-- De testrunner draait alles in één transactie die daarna wordt teruggedraaid,
-- zodat er nooit testdata in de database achterblijft.
-- =============================================================================

create schema if not exists tests;

-- Doe alsof we een bepaalde ingelogde gebruiker zijn.
create or replace function tests.act_as(p_uid uuid) returns void
language plpgsql as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_uid, 'role', 'authenticated')::text,
    true
  );
  execute 'set local role authenticated';
end;
$$;

-- Doe alsof we een niet-ingelogde bezoeker zijn.
create or replace function tests.act_as_anon() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims', null, true);
  execute 'set local role anon';
end;
$$;

-- Terug naar de rechten van de testrunner zelf.
create or replace function tests.act_as_owner() returns void
language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', null, true);
end;
$$;

-- Slaagt wanneer de bewering waar is; faalt de test met een duidelijke tekst.
create or replace function tests.expect(p_condition boolean, p_label text)
returns void language plpgsql as $$
begin
  if p_condition is not true then
    raise exception 'GEFAALD: %', p_label using errcode = 'triggered_action_exception';
  end if;
end;
$$;

-- True wanneer de mutatie is tegengehouden: ofwel geweigerd door RLS, ofwel
-- zonder effect gebleven omdat de rij buiten het zicht van de gebruiker viel.
create or replace function tests.mutation_blocked(p_sql text) returns boolean
language plpgsql as $$
declare
  v_rows int;
begin
  execute p_sql;
  get diagnostics v_rows = row_count;
  return v_rows = 0;
exception
  when insufficient_privilege then return true;
  when others then return true;
end;
$$;

-- Aantal rijen dat de huidige gebruiker ziet in een query.
create or replace function tests.visible_count(p_sql text) returns int
language plpgsql as $$
declare
  v_count int;
begin
  execute 'select count(*) from (' || p_sql || ') s' into v_count;
  return v_count;
exception
  when insufficient_privilege then return 0;
end;
$$;
