-- =============================================================================
-- YogaCompany — een rijker klantdossier (bouwprompt §7.4, §8.1, §8.3)
--
-- Wat hier gebeurt en waarom het zorgvuldig moet
-- ----------------------------------------------
-- §8.1 zegt: dataminimalisatie, alleen velden met een aantoonbaar doel. De
-- opdrachtgever wil meer vastleggen om klanten beter te kunnen volgen en
-- bedienen. Dat mag, maar "zoveel mogelijk" is geen doel. Elk veld hieronder
-- heeft er daarom één, en die staat erbij. Wie er een veld bij wil, schrijft
-- het doel erbij of laat het weg.
--
-- Twee soorten gegevens, twee plekken
-- -----------------------------------
--   1. Gewone persoonsgegevens (geboortedatum, woonplaats, interesses) gaan in
--      `profiles`. Toestemming voor mailings zit al in `marketing_consent_at`.
--
--   2. Gezondheid — blessures, klachten, aandachtspunten — zijn **bijzondere
--      persoonsgegevens** (AVG art. 9). Die mogen alleen met uitdrukkelijke
--      toestemming, en §8.3 schrijft er een apart schema met strengere
--      policies voor voor. Vandaar `sensitive`.
--
-- Dat onderscheid is geen formaliteit: bij een datalek gelden voor de tweede
-- categorie zwaardere verplichtingen, en door ze te scheiden is precies te
-- zeggen wat er wel en niet is uitgelekt.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Gewone klantgegevens
-- -----------------------------------------------------------------------------
alter table profiles
  -- Doel: een attentie op de verjaardag, en leeftijd als context bij het
  -- samenstellen van een programma. Alleen de datum, geen leeftijdscontrole.
  add column birth_date date,
  -- Doel: inschatten of iemand bij de studio in de buurt woont, en spreiding
  -- van het aanbod. Bewust alleen de plaats — geen straat of huisnummer, want
  -- daar is geen doel voor zolang er niet gefactureerd hoeft te worden (§8.1).
  add column city text,
  -- Doel: weten wat werkt in de werving.
  add column how_found text,
  -- Doel: een les of opleiding kiezen die past.
  add column experience_level text,
  -- Doel: het gesprek voeren over waar iemand naartoe wil.
  add column goals text,
  -- Doel: mailings gericht versturen in plaats van alles naar iedereen. Alleen
  -- van betekenis in combinatie met `marketing_consent_at`.
  add column interests text[] not null default '{}';

comment on column profiles.birth_date is
  'Doel: verjaardagsattentie en leeftijd als context. Geen leeftijdscontrole.';
comment on column profiles.city is
  'Alleen de woonplaats. Geen adres: daar is geen doel voor (§8.1).';
comment on column profiles.interests is
  'Onderwerpen voor gerichte mailings. Alleen bruikbaar met marketing_consent_at.';

-- -----------------------------------------------------------------------------
-- 2. Verslagen naast notities
--
-- Een notitie is een losse observatie, een verslag is de neerslag van een
-- gesprek of een les. Ze horen in dezelfde tijdlijn thuis, dus het wordt één
-- tabel met een soort erbij in plaats van twee tabellen die je steeds moet
-- samenvoegen.
-- -----------------------------------------------------------------------------
create type crm_note_kind as enum ('notitie', 'verslag');

alter table crm_notes
  add column kind crm_note_kind not null default 'notitie',
  add column title text;

comment on table crm_notes is
  'Interne notities en verslagen bij een klant. Uitsluitend zichtbaar voor beheerders; de klant ziet ze nooit.';

create index crm_notes_soort_idx on crm_notes (profile_id, kind, created_at desc);

-- -----------------------------------------------------------------------------
-- 3. Gezondheidsgegevens — apart schema, strengere policies (§8.3)
-- -----------------------------------------------------------------------------
create schema if not exists sensitive;

comment on schema sensitive is
  'Bijzondere persoonsgegevens (AVG art. 9). Uitsluitend voor beheerders, nooit via de publieke API, en met een eigen bewaartermijn.';

-- Niet aan PostgREST blootstellen: dit schema staat niet in de exposed schemas
-- van Supabase, dus er is geen REST-eindpunt voor. Bereikbaar is het alleen
-- server-side via de service-role of via de functies hieronder.
revoke all on schema sensitive from anon, authenticated;
grant usage on schema sensitive to service_role;

create table sensitive.client_health (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  -- Blessures, klachten, medicatie, aandachtspunten bij het bewegen.
  body text not null,
  -- Uitdrukkelijke toestemming van de klant om dit vast te leggen. Zonder
  -- datum hier hoort er niets in `body` te staan; de applicatie dwingt dat af
  -- en de beheerder bevestigt het bij het opslaan.
  consent_at timestamptz not null,
  consent_note text,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table sensitive.client_health is
  'Gezondheidsinformatie bij een klant. Bijzondere persoonsgegevens: alleen met uitdrukkelijke toestemming, bewaartermijn 2 jaar na het laatste contact (§8.3).';

alter table sensitive.client_health enable row level security;
-- Geen enkele policy: `anon` en `authenticated` komen er dus nooit in, ook niet
-- als het schema ooit per ongeluk wordt blootgesteld. Alleen de service-role,
-- die RLS omzeilt, kan hierbij — en die draait uitsluitend server-side.

-- -----------------------------------------------------------------------------
-- 4. Gegenereerde gespreksverslagen
--
-- Wordt bewaard zodat een verslag niet bij elke weergave opnieuw gegenereerd
-- hoeft te worden, en zodat terug te zien is wat er ooit is gemaakt. De
-- beheerder bepaalt wat hij ervan met de klant deelt; het staat nergens in het
-- portaal.
-- -----------------------------------------------------------------------------
create table crm_analyses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  -- Welk model het schreef, zodat een oud verslag te plaatsen is.
  model text not null,
  -- Of de gezondheidsgegevens zijn meegestuurd. Verantwoording achteraf.
  bevat_gezondheid boolean not null default false,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index crm_analyses_profile_idx on crm_analyses (profile_id, created_at desc);

comment on table crm_analyses is
  'Door de AI geschreven gespreksverslagen. Alleen voor de beheerder; de klant ziet ze niet.';

alter table crm_analyses enable row level security;

revoke all on crm_analyses from anon, authenticated;
grant select, insert, update, delete on crm_analyses to authenticated;

create policy "analyse: admin doet alles"
  on crm_analyses for all to authenticated
  using (is_admin()) with check (is_admin());

-- -----------------------------------------------------------------------------
-- 5. AVG-verwijdering neemt het nieuwe werk mee
--
-- Zonder deze aanpassing zouden gezondheidsgegevens en gespreksverslagen na een
-- verwijderverzoek blijven staan. Dat zijn juist de gevoeligste gegevens die we
-- hebben.
-- -----------------------------------------------------------------------------
create or replace function anonimiseer_profiel(p_profile_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (is_admin() or auth.uid() is null) then
    raise exception 'Alleen een beheerder kan een profiel anonimiseren'
      using errcode = 'insufficient_privilege';
  end if;

  delete from messages
   where conversation_id in (select id from conversations where profile_id = p_profile_id);
  delete from conversations where profile_id = p_profile_id;
  delete from requests where profile_id = p_profile_id;
  delete from crm_notes where profile_id = p_profile_id;
  delete from progress where profile_id = p_profile_id;
  delete from bookings where profile_id = p_profile_id;

  -- De gevoeligste twee gaan er volledig uit, niet geanonimiseerd.
  delete from sensitive.client_health where profile_id = p_profile_id;
  delete from crm_analyses where profile_id = p_profile_id;

  update orders
     set description = 'Verwijderde klant'
   where profile_id = p_profile_id;

  update profiles
     set first_name = 'Verwijderde',
         last_name = 'klant',
         email = 'verwijderd+' || p_profile_id || '@yogacompanie.invalid',
         phone = null,
         birth_date = null,
         city = null,
         how_found = null,
         experience_level = null,
         goals = null,
         interests = '{}',
         marketing_consent_at = null,
         deleted_at = coalesce(deleted_at, now())
   where id = p_profile_id;
end;
$$;

revoke execute on function anonimiseer_profiel(uuid) from anon, public;
grant execute on function anonimiseer_profiel(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 6. Bewaartermijn voor de gezondheidsgegevens (§8.3)
--
-- Twee jaar na de laatste wijziging. Wie al twee jaar niet meer komt, hoeft
-- niet met zijn blessures in onze database te blijven staan.
-- -----------------------------------------------------------------------------
create or replace function opruimen_bewaartermijnen()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_contactberichten int;
  v_auditregels int;
  v_mailings int;
  v_profielen int;
  v_gezondheid int;
  v_profiel record;
begin
  if not (is_admin() or auth.uid() is null) then
    raise exception 'Alleen een beheerder kan de opschoontaak uitvoeren'
      using errcode = 'insufficient_privilege';
  end if;

  delete from contact_messages where created_at < now() - interval '12 months';
  get diagnostics v_contactberichten = row_count;

  delete from mailings where created_at < now() - interval '12 months';
  get diagnostics v_mailings = row_count;

  delete from sensitive.client_health
   where updated_at < now() - interval '2 years';
  get diagnostics v_gezondheid = row_count;

  v_profielen := 0;
  for v_profiel in
    select id from profiles
     where deleted_at is not null
       and deleted_at < now() - interval '6 months'
       and email not like 'verwijderd+%@yogacompanie.invalid'
  loop
    perform anonimiseer_profiel(v_profiel.id);
    v_profielen := v_profielen + 1;
  end loop;

  delete from audit_log where created_at < now() - interval '24 months';
  get diagnostics v_auditregels = row_count;

  return jsonb_build_object(
    'contactberichten', v_contactberichten,
    'mailings', v_mailings,
    'profielen', v_profielen,
    'gezondheidsgegevens', v_gezondheid,
    'auditregels', v_auditregels
  );
end;
$$;

comment on function opruimen_bewaartermijnen is
  'Voert de bewaartermijnen uit BOUWPROMPT §17.6 en §8.3 uit. Zie docs/avg.md.';

revoke execute on function opruimen_bewaartermijnen from anon, public;
grant execute on function opruimen_bewaartermijnen to authenticated;

-- -----------------------------------------------------------------------------
-- 7. De enige weg naar de gezondheidsgegevens
--
-- Het schema `sensitive` staat niet in de blootgestelde schema's van Supabase,
-- dus er is geen REST-eindpunt voor. Deze twee functies zijn de enige ingang.
-- Ze staan in `public`, controleren zelf of de aanroeper beheerder is, en
-- schrijven een regel in het audit log — dat is wat §8.3 bedoelt met "alleen
-- via audit-gelogde views".
--
-- Het lezen wordt bewust ook gelogd. Wie inzage heeft gehad in andermans
-- gezondheidsgegevens hoort terug te vinden te zijn.
-- -----------------------------------------------------------------------------
create or replace function haal_gezondheid(p_profile_id uuid)
returns table (
  body text,
  consent_at timestamptz,
  consent_note text,
  updated_at timestamptz,
  updated_by uuid
)
language plpgsql security definer set search_path = public, sensitive as $$
begin
  if not is_admin() then
    raise exception 'Alleen een beheerder kan gezondheidsgegevens inzien'
      using errcode = 'insufficient_privilege';
  end if;

  insert into audit_log (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), 'gezondheid_ingezien', 'sensitive.client_health',
          p_profile_id::text, null);

  return query
    select h.body, h.consent_at, h.consent_note, h.updated_at, h.updated_by
    from sensitive.client_health h
    where h.profile_id = p_profile_id;
end;
$$;

revoke execute on function haal_gezondheid(uuid) from anon, public;
grant execute on function haal_gezondheid(uuid) to authenticated;

create or replace function bewaar_gezondheid(
  p_profile_id uuid,
  p_body text,
  p_consent_note text default null
)
returns void
language plpgsql security definer set search_path = public, sensitive as $$
begin
  if not is_admin() then
    raise exception 'Alleen een beheerder kan gezondheidsgegevens vastleggen'
      using errcode = 'insufficient_privilege';
  end if;

  -- Leeg opslaan betekent wissen. Dan hoort er ook geen toestemming meer te
  -- blijven staan.
  if coalesce(trim(p_body), '') = '' then
    delete from sensitive.client_health where profile_id = p_profile_id;

    insert into audit_log (actor_id, action, entity, entity_id, meta)
    values (auth.uid(), 'gezondheid_gewist', 'sensitive.client_health',
            p_profile_id::text, null);
    return;
  end if;

  insert into sensitive.client_health (
    profile_id, body, consent_at, consent_note, updated_by, updated_at
  )
  values (p_profile_id, p_body, now(), p_consent_note, auth.uid(), now())
  on conflict (profile_id) do update
    set body = excluded.body,
        consent_note = excluded.consent_note,
        updated_by = excluded.updated_by,
        updated_at = now();

  -- De inhoud gaat bewust niet mee in het log: dat zou een tweede kopie van
  -- juist deze gegevens opleveren (§8.1).
  insert into audit_log (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), 'gezondheid_bijgewerkt', 'sensitive.client_health',
          p_profile_id::text, null);
end;
$$;

revoke execute on function bewaar_gezondheid(uuid, text, text) from anon, public;
grant execute on function bewaar_gezondheid(uuid, text, text) to authenticated;
