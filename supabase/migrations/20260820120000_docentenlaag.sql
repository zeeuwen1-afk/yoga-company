-- =============================================================================
-- YogaCompany — de docentenlaag
--
-- Strippenkaarten die bij meerdere docenten van dezelfde studio geldig zijn,
-- met registratie van het gebruik en maandelijkse facturatie tussen docenten
-- onderling.
--
-- Het model in één zin
-- --------------------
-- Een docent verkoopt een kaart en int dat geld zelf. Volgt de klant daarmee
-- een les bij een collega, dan stuurt die collega aan het eind van de maand
-- een factuur. Er loopt geen geld via dit platform: het registreert, rekent en
-- maakt de factuur klaar.
--
-- Waarom er geen rol 'docent' bij komt
-- ------------------------------------
-- `user_role` is een enum. Een waarde toevoegen én hem in dezelfde transactie
-- gebruiken kan Postgres niet, en de migratierunner draait elke migration in
-- één transactie. Docent-zijn volgt daarom uit `studio_teachers`: wie daar een
-- actieve rij heeft, geeft les bij die studio. Dat is bovendien accurater — je
-- bent docent *bij een studio*, niet in het algemeen — en het laat een docent
-- gewoon ook klant zijn, wat hij vaak is: docenten kopen elkaars kaarten.
--
-- Waarom de verrekenwaarde op de afboeking wordt bevroren
-- ------------------------------------------------------
-- Een tarief wijzigen mag een verstuurde factuur nooit veranderen. Zou de
-- maandstaat het bedrag uit `pass_products` lezen, dan is het aanpassen van een
-- prijs hetzelfde als het herschrijven van de boekhouding van vorige maand.
-- Daarom kopieert `pass_usages` het bedrag op het moment van afboeken.
-- =============================================================================

create type settlement_status as enum (
  'concept',      -- de maand loopt nog
  'zichtbaar',    -- de maand is voorbij, beide docenten kunnen kijken en bezwaar maken
  'definitief',   -- bedragen liggen vast
  'gefactureerd'  -- er hangt een factuur aan
);

create type pass_status as enum ('actief', 'verlopen', 'ingetrokken');
create type pass_usage_status as enum ('open', 'verrekend', 'teruggedraaid');
create type invoice_type as enum ('factuur', 'credit');

-- -----------------------------------------------------------------------------
-- 1. Studio's en wie er lesgeeft
-- -----------------------------------------------------------------------------
create table studios (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  plaats text not null,
  -- De harde bovengrens van de ruimte. Een les mag hier niet overheen; zie de
  -- trigger bij class_sessions. Rinske Almere zit op acht matten.
  max_deelnemers int not null,
  actief boolean not null default true,
  created_at timestamptz not null default now(),
  constraint studios_max_positief check (max_deelnemers > 0)
);

comment on table studios is
  'Locaties waar lesgegeven wordt. Een kaart is altijd aan precies één studio gebonden.';

create table studio_teachers (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  actief_vanaf date not null default current_date,
  actief_tot date,
  created_at timestamptz not null default now(),
  unique (studio_id, profile_id),
  constraint studio_teachers_periode check (actief_tot is null or actief_tot >= actief_vanaf)
);

comment on table studio_teachers is
  'Wie geeft les bij welke studio. Tevens het antwoord op de vraag of iemand docent is.';

create index studio_teachers_profiel_idx on studio_teachers (profile_id);

-- -----------------------------------------------------------------------------
-- 2. Factuurgegevens per docent
--
-- De factuur komt van de docent, niet van dit platform. Elke docent heeft dus
-- een eigen doorlopende nummerreeks — en de meesten hebben er al een voor hun
-- overige werk. Vandaar een instelbaar voorvoegsel en beginnummer.
-- -----------------------------------------------------------------------------
create table teacher_billing (
  profile_id uuid primary key references profiles (id) on delete cascade,
  bedrijfsnaam text not null,
  adres text not null,
  postcode text not null,
  plaats text not null,
  kvk_nummer text,
  btw_nummer text,
  -- Staat vast op 'btw_plichtig'. De kolom bestaat zodat de kleineondernemers-
  -- regeling later geen migratie kost op een tabel waar dan facturen aan hangen;
  -- de afwijkende factuuropmaak is bewust niet gebouwd, want niemand in deze
  -- groep valt eronder.
  btw_profiel text not null default 'btw_plichtig',
  -- In promille, zodat 21% exact is: 210. Geen kommagetallen in geldzaken.
  btw_tarief_promille int not null default 210,
  factuur_voorvoegsel text not null default 'YC',
  volgend_factuurnummer int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teacher_billing_profiel check (btw_profiel in ('btw_plichtig', 'kor')),
  constraint teacher_billing_tarief check (btw_tarief_promille between 0 and 1000),
  constraint teacher_billing_nummer check (volgend_factuurnummer > 0)
);

create trigger teacher_billing_touch_updated_at
  before update on teacher_billing
  for each row execute function touch_updated_at();

-- -----------------------------------------------------------------------------
-- 3. De vaste plek in het rooster
--
-- Rinske verhuurt per wekelijkse plek: honderd euro per maand voor één les per
-- week. Dit is tegelijk het scharnier naar een eventuele latere marktplaats
-- voor ruimteverhuur; daarom staat het los van de losse lessen.
-- -----------------------------------------------------------------------------
create table room_slots (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete cascade,
  docent_id uuid not null references profiles (id) on delete restrict,
  weekdag int not null,
  begintijd time not null,
  duur_minuten int not null default 75,
  maandhuur_centen int not null,
  actief_vanaf date not null default current_date,
  actief_tot date,
  created_at timestamptz not null default now(),
  constraint room_slots_weekdag check (weekdag between 1 and 7),
  constraint room_slots_huur check (maandhuur_centen >= 0),
  constraint room_slots_duur check (duur_minuten > 0)
);

comment on table room_slots is
  'Vaste wekelijkse plek in het rooster van een studio, met de maandhuur die de docent daarvoor betaalt.';

-- -----------------------------------------------------------------------------
-- 4. Producten: strippenkaarten en abonnementen
-- -----------------------------------------------------------------------------
create table pass_products (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios (id) on delete restrict,
  naam text not null,
  toelichting text,
  -- Leeg bij een abonnement: daar zit geen vast aantal strippen op.
  aantal_lessen int,
  -- Consumentenprijs, inclusief 9% btw — dat is het tarief voor yogalessen.
  prijs_centen int not null,
  -- Wat de lesgevende docent factureert wanneer deze kaart bij hem wordt
  -- gebruikt. EXCLUSIEF btw, want de uitgever droeg over zijn ontvangst al
  -- btw af; zou hier het brutobedrag staan, dan betaalt hij meer terug dan hij
  -- overhield. Leeg wanneer kruisgebruik niet mag.
  verrekenwaarde_centen int,
  geldigheid_dagen int,
  uitloop_dagen int not null default 0,
  kruisgebruik_toegestaan boolean not null default true,
  -- Alleen ingevuld bij abonnementen. Het plafond blokkeert niet: boven het
  -- plafond gaat de les gewoon door en betaalt de uitgever ook. Het is een
  -- signaal in de docentenportal, geen deur die dichtvalt voor de klant.
  max_kruislessen_per_maand int,
  geldig_vanaf date not null default current_date,
  volgorde int not null default 0,
  actief boolean not null default true,
  created_at timestamptz not null default now(),
  constraint pass_products_prijs check (prijs_centen >= 0),
  constraint pass_products_aantal check (aantal_lessen is null or aantal_lessen > 0),
  constraint pass_products_verrekenwaarde check (
    verrekenwaarde_centen is null or verrekenwaarde_centen >= 0
  ),
  -- Mag de kaart bij een collega worden gebruikt, dan moet er een bedrag zijn
  -- om te factureren. Anders ontstaat er een afboeking zonder waarde.
  constraint pass_products_kruisgebruik_heeft_waarde check (
    not kruisgebruik_toegestaan or verrekenwaarde_centen is not null
  )
);

comment on column pass_products.verrekenwaarde_centen is
  'Exclusief btw. Wordt bij afboeken gekopieerd naar pass_usages en daar bevroren.';

-- -----------------------------------------------------------------------------
-- 5. Verkochte kaarten
-- -----------------------------------------------------------------------------
create table passes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references pass_products (id) on delete restrict,
  -- De docent die de kaart verkocht en het geld ontving. Hij houdt de
  -- verplichting en betaalt bij kruisgebruik.
  uitgevende_docent_id uuid not null references profiles (id) on delete restrict,
  -- Leeg bij een abonnement: dat kent geen aftellend saldo.
  saldo int,
  geldig_van date not null default current_date,
  geldig_tot date,
  status pass_status not null default 'actief',
  uitgegeven_op timestamptz not null default now(),
  opmerking text,
  constraint passes_saldo check (saldo is null or saldo >= 0)
);

create index passes_klant_idx on passes (profile_id, status);
create index passes_uitgever_idx on passes (uitgevende_docent_id, status);

comment on table passes is
  'Een verkochte strippenkaart of abonnement. Altijd van één klant, uitgegeven door één docent.';

-- -----------------------------------------------------------------------------
-- 6. Afboekingen
--
-- Hangt aan de boeking en niet aan (kaart × les): een boeking is al uniek per
-- klant per les, en annuleren-en-opnieuw-boeken hergebruikt diezelfde rij. Zo
-- kan er nooit een tweede afboeking voor dezelfde plek ontstaan.
-- -----------------------------------------------------------------------------
create table pass_usages (
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references passes (id) on delete restrict,
  booking_id uuid not null unique references bookings (id) on delete cascade,
  class_session_id uuid not null references class_sessions (id) on delete restrict,
  -- Wie de les gaf. Bepaalt of er iets te factureren valt en aan wie.
  docent_die_lesgaf_id uuid not null references profiles (id) on delete restrict,
  -- Bevroren op het moment van afboeken. Zie de kop van dit bestand.
  verrekenwaarde_centen int not null,
  is_kruisgebruik boolean not null,
  status pass_usage_status not null default 'open',
  afgeboekt_op timestamptz not null default now(),
  teruggedraaid_op timestamptz,
  constraint pass_usages_waarde check (verrekenwaarde_centen >= 0)
);

create index pass_usages_pass_idx on pass_usages (pass_id);
create index pass_usages_docent_idx on pass_usages (docent_die_lesgaf_id, afgeboekt_op);
create index pass_usages_open_kruis_idx on pass_usages (afgeboekt_op)
  where is_kruisgebruik and status = 'open';

-- -----------------------------------------------------------------------------
-- 7. Maandstaten en facturen
-- -----------------------------------------------------------------------------
create table settlements (
  id uuid primary key default gen_random_uuid(),
  -- Altijd de eerste dag van de maand waar het over gaat.
  periode date not null,
  -- De uitgever van de kaart betaalt; de docent die lesgaf ontvangt.
  van_docent_id uuid not null references profiles (id) on delete restrict,
  naar_docent_id uuid not null references profiles (id) on delete restrict,
  subtotaal_centen int not null default 0,
  btw_tarief_promille int not null default 210,
  btw_centen int not null default 0,
  totaal_centen int not null default 0,
  status settlement_status not null default 'concept',
  zichtbaar_vanaf timestamptz,
  definitief_op timestamptz,
  created_at timestamptz not null default now(),
  unique (periode, van_docent_id, naar_docent_id),
  constraint settlements_niet_aan_zichzelf check (van_docent_id <> naar_docent_id),
  constraint settlements_eerste_van_maand check (extract(day from periode) = 1)
);

comment on table settlements is
  'Wat één docent een andere docent over één maand verschuldigd is. Twee docenten die elkaar iets schuldig zijn krijgen twee staten, nooit één gesaldeerde.';

create table settlement_lines (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlements (id) on delete cascade,
  -- Een afboeking kan maar op één maandstaat staan.
  pass_usage_id uuid not null unique references pass_usages (id) on delete restrict,
  bedrag_centen int not null,
  constraint settlement_lines_bedrag check (bedrag_centen >= 0)
);

create index settlement_lines_staat_idx on settlement_lines (settlement_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlements (id) on delete restrict,
  -- De afzender van de factuur: de docent die de les gaf.
  docent_id uuid not null references profiles (id) on delete restrict,
  factuurnummer text not null,
  factuurdatum date not null default current_date,
  type invoice_type not null default 'factuur',
  subtotaal_centen int not null,
  btw_tarief_promille int not null,
  btw_centen int not null,
  totaal_centen int not null,
  -- De gegevens van beide partijen worden gekopieerd, niet gekoppeld. Verhuist
  -- een docent volgend jaar, dan mag de factuur van vorige maand niet
  -- meeveranderen.
  afzender_gegevens jsonb not null,
  ontvanger_gegevens jsonb not null,
  created_at timestamptz not null default now(),
  unique (docent_id, factuurnummer)
);

comment on table invoices is
  'Een verstuurde factuur tussen twee docenten. Onwijzigbaar; een correctie is een creditfactuur.';

create table teacher_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  bedrag_centen int not null,
  ingangsdatum date not null default current_date,
  opzegdatum date,
  actief boolean not null default true,
  created_at timestamptz not null default now(),
  constraint teacher_subscriptions_bedrag check (bedrag_centen >= 0)
);

comment on table teacher_subscriptions is
  'Het abonnement dat een docent bij YogaCompany afneemt. Mag leeg blijven tot er een prijs is.';

-- -----------------------------------------------------------------------------
-- 8. Het rooster krijgt een studio en een docent
--
-- Zonder die twee valt er niets te verrekenen: "wie gaf de les" is de kern van
-- deze hele laag. Bestaande lessen worden aan de eerste studio gehangen.
-- -----------------------------------------------------------------------------
alter table class_sessions
  add column studio_id uuid references studios (id) on delete restrict,
  add column docent_id uuid references profiles (id) on delete restrict;

create index class_sessions_docent_idx on class_sessions (docent_id, starts_at);

-- -----------------------------------------------------------------------------
-- 9. Hulpfuncties
--
-- Alle drie `security definer` met een vaste `search_path`, in de stijl van
-- `is_admin()`. Zonder dat zou een policy op een tabel diezelfde tabel
-- bevragen en oneindig recursief worden.
-- -----------------------------------------------------------------------------
create or replace function is_docent() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from studio_teachers st
    join profiles p on p.id = st.profile_id
    where st.profile_id = auth.uid()
      and p.deleted_at is null
      and (st.actief_tot is null or st.actief_tot >= current_date)
  );
$$;

comment on function is_docent is
  'True wanneer de huidige sessie bij minstens één studio als docent staat.';

create or replace function geeft_les(p_session_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_sessions
    where id = p_session_id and docent_id = auth.uid()
  );
$$;

comment on function geeft_les is
  'True wanneer de huidige sessie de docent van deze les is. Bepaalt wie de deelnemerslijst mag zien.';

-- Het maximum van de studio waar een les valt. Los, zodat de check-trigger
-- hem kan gebruiken zonder RLS te raken.
create or replace function studio_maximum(p_studio_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select max_deelnemers from studios where id = p_studio_id;
$$;

-- Een les mag nooit meer plekken hebben dan er matten liggen. De beheerder
-- typt de capaciteit met de hand; dit is de vangrail daaronder.
create or replace function bewaak_capaciteit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_max int;
begin
  if new.studio_id is null then
    return new;
  end if;

  v_max := studio_maximum(new.studio_id);

  if v_max is not null and new.capacity > v_max then
    raise exception
      'Deze studio heeft plaats voor % deelnemers, niet %', v_max, new.capacity
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger class_sessions_bewaak_capaciteit
  before insert or update on class_sessions
  for each row execute function bewaak_capaciteit();

-- -----------------------------------------------------------------------------
-- 10. Een kaart afboeken
--
-- Waarom dit in `boek_les` zit en niet ernaast: die functie vergrendelt de
-- lesregel en telt pas daarna de bezette plekken. Zou de strip er buiten die
-- vergrendeling af gaan, dan kan iemand bij twee gelijktijdige verzoeken
-- boeken zonder strip, of twee strippen kwijtraken voor één plek.
--
-- De parameter heeft een standaardwaarde, zodat bestaande aanroepen met één
-- argument blijven werken: een les zonder studio is een gewone les zonder
-- kaart. De oude versie met één parameter moet daarvoor eerst weg — anders
-- passen bij `boek_les(uuid)` allebei en weigert Postgres te kiezen.
-- -----------------------------------------------------------------------------
drop function if exists boek_les(uuid);

create or replace function boek_les(p_session_id uuid, p_pass_id uuid default null)
returns booking_status
language plpgsql security definer set search_path = public as $$
declare
  v_profiel uuid := auth.uid();
  v_sessie class_sessions;
  v_bezet int;
  v_status booking_status;
  v_booking uuid;
  v_pass passes;
  v_product pass_products;
  v_kruis boolean;
begin
  if v_profiel is null then
    raise exception 'Log in om een les te boeken'
      using errcode = 'insufficient_privilege';
  end if;

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
    raise exception 'Deze les is al begonnen' using errcode = 'check_violation';
  end if;

  if exists (
    select 1 from bookings
    where class_session_id = p_session_id
      and profile_id = v_profiel
      and status in ('geboekt', 'wachtlijst')
  ) then
    raise exception 'Je hebt deze les al geboekt' using errcode = 'check_violation';
  end if;

  -- --- De kaart nakijken, vóór er iets wordt vastgelegd ---------------------
  if p_pass_id is not null then
    select * into v_pass from passes where id = p_pass_id for update;

    if not found or v_pass.profile_id <> v_profiel then
      raise exception 'Deze kaart is niet van jou' using errcode = 'check_violation';
    end if;

    if v_pass.status <> 'actief' then
      raise exception 'Deze kaart is niet meer geldig' using errcode = 'check_violation';
    end if;

    if v_pass.geldig_tot is not null and v_pass.geldig_tot < current_date then
      raise exception 'Deze kaart is verlopen' using errcode = 'check_violation';
    end if;

    select * into v_product from pass_products where id = v_pass.product_id;

    -- Een kaart geldt bij precies één studio. Dit is de regel die voorkomt dat
    -- iemand met een kaart van Rinske een privéles of een les bij Rafa boekt.
    if v_sessie.studio_id is null or v_sessie.studio_id <> v_product.studio_id then
      raise exception 'Deze kaart geldt niet voor deze les'
        using errcode = 'check_violation';
    end if;

    v_kruis := v_sessie.docent_id is distinct from v_pass.uitgevende_docent_id;

    if v_kruis and not v_product.kruisgebruik_toegestaan then
      raise exception
        'Deze kaart geldt alleen bij de docent die hem heeft uitgegeven'
        using errcode = 'check_violation';
    end if;

    if v_pass.saldo is not null and v_pass.saldo < 1 then
      raise exception 'Deze kaart is op' using errcode = 'check_violation';
    end if;
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
        cancelled_at = null
  returning id into v_booking;

  -- Alleen een echte plek kost een strip. Wie op de wachtlijst staat heeft
  -- niets, en betaalt dus ook niets; bij doorschuiven gaat de strip er alsnog
  -- af (zie annuleer_boeking).
  if p_pass_id is not null and v_status = 'geboekt' then
    perform boek_strip_af(p_pass_id, v_booking, p_session_id);
  end if;

  return v_status;
end;
$$;

revoke execute on function boek_les(uuid, uuid) from anon, public;
grant execute on function boek_les(uuid, uuid) to authenticated;

-- De strip eraf halen en de afboeking vastleggen. Apart, omdat het ook nodig
-- is bij het doorschuiven vanaf de wachtlijst.
create or replace function boek_strip_af(
  p_pass_id uuid, p_booking_id uuid, p_session_id uuid
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_pass passes;
  v_product pass_products;
  v_sessie class_sessions;
  v_kruis boolean;
begin
  select * into v_pass from passes where id = p_pass_id for update;
  select * into v_product from pass_products where id = v_pass.product_id;
  select * into v_sessie from class_sessions where id = p_session_id;

  if v_pass.saldo is not null then
    if v_pass.saldo < 1 then
      raise exception 'Deze kaart is op' using errcode = 'check_violation';
    end if;
    update passes set saldo = saldo - 1 where id = p_pass_id;
  end if;

  v_kruis := v_sessie.docent_id is distinct from v_pass.uitgevende_docent_id;

  insert into pass_usages (
    pass_id, booking_id, class_session_id, docent_die_lesgaf_id,
    verrekenwaarde_centen, is_kruisgebruik
  ) values (
    p_pass_id, p_booking_id, p_session_id, v_sessie.docent_id,
    -- Bevriezen. Een tarief dat later wijzigt raakt deze rij niet meer.
    coalesce(v_product.verrekenwaarde_centen, 0),
    coalesce(v_kruis, false)
  )
  on conflict (booking_id) do update
    set pass_id = excluded.pass_id,
        verrekenwaarde_centen = excluded.verrekenwaarde_centen,
        is_kruisgebruik = excluded.is_kruisgebruik,
        docent_die_lesgaf_id = excluded.docent_die_lesgaf_id,
        status = 'open',
        afgeboekt_op = now(),
        teruggedraaid_op = null;
end;
$$;

revoke execute on function boek_strip_af(uuid, uuid, uuid) from anon, authenticated, public;

-- -----------------------------------------------------------------------------
-- 11. Annuleren, met de strip erbij
--
-- Twee termijnen, en dat is met opzet. De boeking mag tot vier uur van tevoren
-- weg — dan kan een wachtlijster nog worden opgeroepen. De strip komt alleen
-- terug bij afmelden tot 24 uur van tevoren; dat is de regel die de studio
-- publiceert ("anders zijn wij genoodzaakt een strip te berekenen"). Later
-- afmelden mag dus, maar kost je de strip.
-- -----------------------------------------------------------------------------
create or replace function annuleer_boeking(p_session_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_profiel uuid := auth.uid();
  v_sessie class_sessions;
  v_status booking_status;
  v_booking uuid;
  v_volgende record;
  v_usage pass_usages;
  v_op_tijd boolean;
begin
  if v_profiel is null then
    raise exception 'Log in om een boeking te annuleren'
      using errcode = 'insufficient_privilege';
  end if;

  select * into v_sessie from class_sessions where id = p_session_id for update;

  if not found then
    raise exception 'Deze les bestaat niet' using errcode = 'check_violation';
  end if;

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
  returning id, status into v_booking, v_status;

  if v_booking is null then
    raise exception 'Je hebt geen lopende boeking voor deze les'
      using errcode = 'check_violation';
  end if;

  -- Gaat de les niet door, dan is het nooit de schuld van de klant en komt de
  -- strip altijd terug. Anders geldt de 24-uursgrens.
  v_op_tijd := v_sessie.cancelled_at is not null
    or v_sessie.starts_at - interval '24 hours' > now();

  select * into v_usage from pass_usages
   where booking_id = v_booking and status = 'open';

  if found then
    if v_op_tijd then
      update passes set saldo = saldo + 1
       where id = v_usage.pass_id and saldo is not null;
      update pass_usages
         set status = 'teruggedraaid', teruggedraaid_op = now()
       where id = v_usage.id;
    end if;
    -- Te laat: de afboeking blijft staan en wordt gewoon verrekend. De klant
    -- is zijn strip kwijt en de docent die klaarstond krijgt betaald.
  end if;

  -- Kwam er een plek vrij, dan schuift de eerste wachtlijster door. Heeft die
  -- een kaart meegegeven die inmiddels op of verlopen is, dan lukt het
  -- afboeken niet; hij blijft dan staan en de volgende is aan de beurt.
  if v_sessie.cancelled_at is null then
    for v_volgende in
      select b.id, b.profile_id
        from bookings b
       where b.class_session_id = p_session_id and b.status = 'wachtlijst'
       order by b.created_at
    loop
      begin
        update bookings set status = 'geboekt' where id = v_volgende.id;

        -- Een wachtlijster met een openstaande afboeking had al een kaart
        -- gekozen; die wordt nu pas echt afgeboekt.
        if exists (select 1 from pass_usages where booking_id = v_volgende.id) then
          perform boek_strip_af(
            (select pass_id from pass_usages where booking_id = v_volgende.id),
            v_volgende.id,
            p_session_id
          );
        end if;

        exit;
      exception when others then
        -- Deze wachtlijster kan niet doorschuiven; terugzetten en de volgende
        -- proberen. Een lege plek is beter dan een boeking zonder dekking.
        update bookings set status = 'wachtlijst' where id = v_volgende.id;
      end;
    end loop;
  end if;
end;
$$;

revoke execute on function annuleer_boeking(uuid) from anon, public;
grant execute on function annuleer_boeking(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 12. Row Level Security
-- -----------------------------------------------------------------------------
alter table studios enable row level security;
alter table studio_teachers enable row level security;
alter table teacher_billing enable row level security;
alter table room_slots enable row level security;
alter table pass_products enable row level security;
alter table passes enable row level security;
alter table pass_usages enable row level security;
alter table settlements enable row level security;
alter table settlement_lines enable row level security;
alter table invoices enable row level security;
alter table teacher_subscriptions enable row level security;

-- Studio's en producten zijn openbaar: de tarievenpagina toont ze.
create policy "studio: openbaar leesbaar"
  on studios for select to anon, authenticated using (actief);
create policy "studio: admin doet alles"
  on studios for all to authenticated using (is_admin()) with check (is_admin());

create policy "product: openbaar leesbaar"
  on pass_products for select to anon, authenticated using (actief);
create policy "product: admin doet alles"
  on pass_products for all to authenticated using (is_admin()) with check (is_admin());

-- Wie er lesgeeft mag iedereen zien; dat staat ook in het rooster.
create policy "docentschap: openbaar leesbaar"
  on studio_teachers for select to anon, authenticated using (true);
create policy "docentschap: admin doet alles"
  on studio_teachers for all to authenticated using (is_admin()) with check (is_admin());

-- Factuurgegevens zijn van de docent zelf. Een collega ziet ze pas op een
-- factuur, en daar staan ze bevroren op.
create policy "factuurgegevens: eigen rij"
  on teacher_billing for select to authenticated
  using (profile_id = (select auth.uid()));
create policy "factuurgegevens: eigen rij bijwerken"
  on teacher_billing for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
create policy "factuurgegevens: admin doet alles"
  on teacher_billing for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "vaste plek: eigen plekken"
  on room_slots for select to authenticated
  using (docent_id = (select auth.uid()));
create policy "vaste plek: admin doet alles"
  on room_slots for all to authenticated using (is_admin()) with check (is_admin());

-- --- Kaarten ----------------------------------------------------------------
-- De klant ziet zijn eigen kaarten. De docent ziet de kaarten die hij zelf
-- heeft uitgegeven — en nooit die van een collega.
create policy "kaart: eigen kaarten van de klant"
  on passes for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "kaart: de uitgevende docent"
  on passes for select to authenticated
  using (uitgevende_docent_id = (select auth.uid()));

create policy "kaart: uitgeven door de docent"
  on passes for insert to authenticated
  with check (uitgevende_docent_id = (select auth.uid()) and is_docent());

create policy "kaart: admin doet alles"
  on passes for all to authenticated using (is_admin()) with check (is_admin());

-- --- Afboekingen ------------------------------------------------------------
-- Drie partijen hebben er belang bij: de klant (het is zijn strip), de
-- uitgever (hij betaalt), en de docent die lesgaf (hij factureert).
create policy "afboeking: de klant zelf"
  on pass_usages for select to authenticated
  using (
    exists (
      select 1 from passes p
      where p.id = pass_usages.pass_id and p.profile_id = (select auth.uid())
    )
  );

create policy "afboeking: de uitgevende docent"
  on pass_usages for select to authenticated
  using (
    exists (
      select 1 from passes p
      where p.id = pass_usages.pass_id
        and p.uitgevende_docent_id = (select auth.uid())
    )
  );

create policy "afboeking: de docent die lesgaf"
  on pass_usages for select to authenticated
  using (docent_die_lesgaf_id = (select auth.uid()));

create policy "afboeking: admin doet alles"
  on pass_usages for all to authenticated using (is_admin()) with check (is_admin());

-- --- Maandstaten en facturen ------------------------------------------------
create policy "maandstaat: alleen de twee betrokken docenten"
  on settlements for select to authenticated
  using (
    van_docent_id = (select auth.uid()) or naar_docent_id = (select auth.uid())
  );
create policy "maandstaat: admin doet alles"
  on settlements for all to authenticated using (is_admin()) with check (is_admin());

create policy "staatregel: volgt de maandstaat"
  on settlement_lines for select to authenticated
  using (
    exists (
      select 1 from settlements s
      where s.id = settlement_lines.settlement_id
        and (s.van_docent_id = (select auth.uid())
             or s.naar_docent_id = (select auth.uid()))
    )
  );
create policy "staatregel: admin doet alles"
  on settlement_lines for all to authenticated using (is_admin()) with check (is_admin());

create policy "factuur: volgt de maandstaat"
  on invoices for select to authenticated
  using (
    exists (
      select 1 from settlements s
      where s.id = invoices.settlement_id
        and (s.van_docent_id = (select auth.uid())
             or s.naar_docent_id = (select auth.uid()))
    )
  );
create policy "factuur: admin doet alles"
  on invoices for all to authenticated using (is_admin()) with check (is_admin());

create policy "docentabonnement: eigen abonnement"
  on teacher_subscriptions for select to authenticated
  using (profile_id = (select auth.uid()));
create policy "docentabonnement: admin doet alles"
  on teacher_subscriptions for all to authenticated
  using (is_admin()) with check (is_admin());

-- --- De deelnemerslijst -----------------------------------------------------
-- Een docent moet weten wie er voor zijn deur staat. Alleen voor zijn eigen
-- lessen, en alleen de boeking zelf: de overige historie van die klant blijft
-- dicht.
create policy "boeking: de docent van deze les"
  on bookings for select to authenticated
  using (geeft_les(class_session_id));

grant execute on function is_docent() to authenticated;
grant execute on function geeft_les(uuid) to authenticated;

grant select on studios, pass_products, studio_teachers to anon, authenticated;
grant select on passes, pass_usages, settlements, settlement_lines, invoices to authenticated;
grant insert on passes to authenticated;
grant select, update on teacher_billing to authenticated;
grant select on room_slots, teacher_subscriptions to authenticated;
