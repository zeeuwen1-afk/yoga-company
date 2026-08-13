-- =============================================================================
-- YogaCompany — lesrooster en boekingen (bouwprompt §6, §7.1, §7.3, §7.4)
--
-- Kernactiviteit 2 uit §1: de wekelijkse yogalessen. Bezoekers zien het
-- rooster, klanten boeken en annuleren, de beheerder houdt het rooster en de
-- deelnemerslijst bij.
--
-- Naamgeving, let op
-- ------------------
-- De bestaande tabel `lessons` gaat over lesmateriaal bínnen een opleiding.
-- Het rooster gaat over een yogales op een tijdstip. Dat zijn twee heel
-- verschillende dingen die in het Nederlands allebei "les" heten. Om ze uit
-- elkaar te houden heet het rooster hier `class_sessions`.
--
-- Waarom boeken en annuleren functies zijn en geen INSERT
-- ------------------------------------------------------
-- Een plek vergeven is een telling gevolgd door een schrijfactie. Doen twee
-- mensen dat tegelijk, dan tellen ze allebei "nog één plek vrij" en zitten er
-- daarna dertien mensen in een les van twaalf. `boek_les` vergrendelt daarom
-- eerst de lesregel en telt pas daarna. Zolang die functie de enige weg naar
-- binnen is, kan de capaciteit niet worden overschreden — ook niet door een
-- fout in de applicatiecode. Klanten krijgen om die reden alleen leesrecht op
-- `bookings`.
-- =============================================================================

create type booking_status as enum (
  'geboekt',
  'wachtlijst',
  'geannuleerd',
  'niet_verschenen'
);

-- -----------------------------------------------------------------------------
-- 1. Het rooster
-- -----------------------------------------------------------------------------
create table class_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  duration_minutes int not null default 60,
  location text not null,
  capacity int not null,
  -- Een afgelaste les blijft staan: de geboekte deelnemers moeten kunnen zien
  -- dát hij niet doorgaat. Verwijderen zou de boekingen stil laten verdwijnen.
  cancelled_at timestamptz,
  cancellation_reason text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_sessions_capaciteit_positief check (capacity > 0),
  constraint class_sessions_duur_positief check (duration_minutes > 0)
);

comment on table class_sessions is
  'Geroosterde yogalessen. Niet te verwarren met `lessons`: dat is lesmateriaal binnen een opleiding.';

create index class_sessions_start_idx on class_sessions (starts_at)
  where is_published;

-- -----------------------------------------------------------------------------
-- 2. Boekingen
-- -----------------------------------------------------------------------------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null
    references class_sessions (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  status booking_status not null default 'geboekt',
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  -- Eén boeking per klant per les. Annuleren zet de status om en laat de rij
  -- staan, zodat opnieuw boeken dezelfde rij hergebruikt.
  unique (class_session_id, profile_id)
);

create index bookings_profile_idx on bookings (profile_id, created_at desc);
create index bookings_sessie_idx on bookings (class_session_id, status);

-- Volgorde op de wachtlijst is volgorde van aanmelden.
create index bookings_wachtlijst_idx on bookings (class_session_id, created_at)
  where status = 'wachtlijst';

create or replace function touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function touch_updated_at() from anon, authenticated, public;

create trigger class_sessions_touch_updated_at
  before update on class_sessions
  for each row execute function touch_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Hoeveel plekken zijn er nog
-- -----------------------------------------------------------------------------
create or replace function vrije_plekken(p_session_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select greatest(
    0,
    c.capacity - (
      select count(*) from bookings b
      where b.class_session_id = c.id and b.status = 'geboekt'
    )
  )
  from class_sessions c
  where c.id = p_session_id;
$$;

comment on function vrije_plekken is
  'Aantal vrije plekken in een les. Security definer omdat een bezoeker de boekingen zelf niet mag zien.';

-- Het rooster zoals de publieke site en het portaal het tonen: zonder wie er
-- geboekt heeft, mét het aantal vrije plekken.
create view class_sessions_public
with (security_invoker = false) as
select
  c.id,
  c.title,
  c.description,
  c.starts_at,
  c.duration_minutes,
  c.location,
  c.capacity,
  c.cancelled_at,
  vrije_plekken(c.id) as free_spots
from class_sessions c
where c.is_published;

comment on view class_sessions_public is
  'Het lesrooster voor bezoekers. Bevat nooit wie er geboekt heeft.';

grant select on class_sessions_public to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. Boeken
--
-- Geeft de status terug die de klant heeft gekregen: 'geboekt' of 'wachtlijst'.
-- -----------------------------------------------------------------------------
create or replace function boek_les(p_session_id uuid) returns booking_status
language plpgsql security definer set search_path = public as $$
declare
  v_profiel uuid := auth.uid();
  v_sessie class_sessions;
  v_bezet int;
  v_status booking_status;
begin
  if v_profiel is null then
    raise exception 'Log in om een les te boeken'
      using errcode = 'insufficient_privilege';
  end if;

  -- `for update` houdt gelijktijdige boekers tegen: de tweede wacht tot de
  -- eerste klaar is en telt daarna pas.
  select * into v_sessie from class_sessions
   where id = p_session_id and is_published
   for update;

  if not found then
    raise exception 'Deze les bestaat niet' using errcode = 'check_violation';
  end if;

  if v_sessie.cancelled_at is not null then
    raise exception 'Deze les gaat niet door' using errcode = 'check_violation';
  end if;

  if v_sessie.starts_at <= now() then
    raise exception 'Deze les is al begonnen'
      using errcode = 'check_violation';
  end if;

  if exists (
    select 1 from bookings
    where class_session_id = p_session_id
      and profile_id = v_profiel
      and status in ('geboekt', 'wachtlijst')
  ) then
    raise exception 'Je hebt deze les al geboekt'
      using errcode = 'check_violation';
  end if;

  select count(*) into v_bezet from bookings
   where class_session_id = p_session_id and status = 'geboekt';

  v_status := case
    when v_bezet < v_sessie.capacity then 'geboekt'
    else 'wachtlijst'
  end;

  insert into bookings (class_session_id, profile_id, status)
  values (p_session_id, v_profiel, v_status)
  on conflict (class_session_id, profile_id) do update
    set status = excluded.status,
        created_at = now(),
        cancelled_at = null;

  return v_status;
end;
$$;

revoke execute on function boek_les(uuid) from anon, public;
grant execute on function boek_les(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Annuleren
--
-- Tot vier uur voor aanvang. Daarna staat de plek al ingepland en heeft de
-- eigenaar er niets meer aan: een wachtlijster kan op zo'n termijn niet meer
-- fatsoenlijk worden opgeroepen.
-- -----------------------------------------------------------------------------
create or replace function annuleer_boeking(p_session_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_profiel uuid := auth.uid();
  v_sessie class_sessions;
  v_status booking_status;
  v_volgende uuid;
begin
  if v_profiel is null then
    raise exception 'Log in om een boeking te annuleren'
      using errcode = 'insufficient_privilege';
  end if;

  select * into v_sessie from class_sessions
   where id = p_session_id
   for update;

  if not found then
    raise exception 'Deze les bestaat niet' using errcode = 'check_violation';
  end if;

  -- Gaat de les niet door, dan mag de klant zijn boeking altijd opruimen.
  if v_sessie.cancelled_at is null
     and v_sessie.starts_at - interval '4 hours' <= now()
  then
    raise exception 'Annuleren kan tot vier uur voor aanvang'
      using errcode = 'check_violation';
  end if;

  update bookings
     set status = 'geannuleerd', cancelled_at = now()
   where class_session_id = p_session_id
     and profile_id = v_profiel
     and status in ('geboekt', 'wachtlijst')
  returning status into v_status;

  if v_status is null then
    raise exception 'Je hebt geen lopende boeking voor deze les'
      using errcode = 'check_violation';
  end if;

  -- Kwam er een plek vrij, dan schuift de eerste wachtlijster door. Wie het
  -- langst wacht is als eerste aan de beurt.
  if v_sessie.cancelled_at is null then
    select id into v_volgende from bookings
     where class_session_id = p_session_id and status = 'wachtlijst'
     order by created_at
     limit 1;

    if v_volgende is not null then
      update bookings set status = 'geboekt' where id = v_volgende;
    end if;
  end if;
end;
$$;

revoke execute on function annuleer_boeking(uuid) from anon, public;
grant execute on function annuleer_boeking(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 6. Row Level Security
-- -----------------------------------------------------------------------------
alter table class_sessions enable row level security;
alter table bookings enable row level security;

create policy "rooster: gepubliceerde lessen zijn openbaar"
  on class_sessions for select to anon, authenticated
  using (is_published);

create policy "rooster: admin doet alles"
  on class_sessions for all to authenticated
  using (is_admin()) with check (is_admin());

-- Klanten lezen uitsluitend hun eigen boekingen. Boeken en annuleren loopt via
-- de functies hierboven; daarom staat er bewust géén insert- of update-policy
-- voor klanten. Zonder die functies zou een klant de capaciteit kunnen negeren
-- of zichzelf van de wachtlijst naar 'geboekt' kunnen zetten. De beheerder
-- muteert wél rechtstreeks, voor de deelnemerslijst en het afmelden.
revoke all on bookings from anon, authenticated;
grant select, insert, update, delete on bookings to authenticated;

create policy "boeking: eigen boekingen lezen"
  on bookings for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "boeking: admin doet alles"
  on bookings for all to authenticated
  using (is_admin()) with check (is_admin());
