-- =============================================================================
-- YogaCompany — mailings afmaken en bewaartermijnen automatiseren
-- (BOUWPROMPT §10.7, §15, §17.6)
--
-- Twee dingen gebeuren hier:
--
--   1. `mailings` krijgt de velden die het verzendproces nodig heeft. De tabel
--      is tegelijk het mailinglog uit §17.6: we bewaren wát er is verstuurd en
--      naar hoevéél mensen, maar nergens naar wie. Een ontvangerslijst per
--      mailing zou een tweede kopie van het klantenbestand zijn en heeft geen
--      doel dat de bewaring rechtvaardigt (§2.5).
--
--   2. De maandelijkse opschoontaak. Bewaartermijnen die alleen in een
--      document staan zijn geen bewaartermijnen; deze functie voert ze uit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. mailings — velden voor het verzendproces en het log
-- -----------------------------------------------------------------------------

-- Nodig om concepten te sorteren en om de bewaartermijn van 12 maanden te
-- kunnen bepalen voor een mailing die nooit is verstuurd.
alter table mailings
  add column created_at timestamptz not null default now();

-- Het aantal ontvangers is de verantwoording achteraf ("naar hoeveel mensen is
-- dit gegaan"). Bewust een getal en geen lijst: zie de kop van dit bestand.
alter table mailings
  add column recipient_count integer not null default 0;

-- Een mislukte verzending moet zichtbaar zijn in het beheer, anders staat een
-- mailing eeuwig op "bezig" zonder dat iemand weet waarom.
alter table mailings
  add column error text;

comment on table mailings is
  'Verstuurde en geplande mailings. Tevens het mailinglog uit BOUWPROMPT §17.6: '
  'inhoud en aantal ontvangers, nooit wie ze ontving.';

create index mailings_created_idx on mailings (created_at desc);

-- -----------------------------------------------------------------------------
-- 2. social_posts — herkomst van het bericht
-- -----------------------------------------------------------------------------

-- Het onderwerp en doel waarmee een caption is gegenereerd. Zonder dit is een
-- eerdere post niet te herhalen of te beoordelen, en zou de beheerder de
-- context bij elke variant opnieuw moeten intypen.
alter table social_posts add column topic text;
alter table social_posts add column goal text;

create index social_posts_created_idx on social_posts (created_at desc);

-- -----------------------------------------------------------------------------
-- 3. Maandelijkse opschoontaak (§17.6)
-- -----------------------------------------------------------------------------
--
-- `security definer` omdat de taak zonder ingelogde gebruiker draait: hij wordt
-- aangeroepen door de cron-route met de service-role. De rechtencontrole zit —
-- net als bij `anonimiseer_profiel` — in de functie zelf, zodat een klant of
-- beheerder hem niet per ongeluk of expres kan misbruiken.
--
-- De functie geeft terug wat hij heeft opgeruimd. Dat is het bewijs dat de
-- bewaartermijnen daadwerkelijk worden uitgevoerd, en het is meteen bruikbaar
-- voor het audit log.
create or replace function opruimen_bewaartermijnen()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contactberichten int;
  v_auditregels int;
  v_mailings int;
  v_profielen int;
  v_profiel record;
begin
  -- Alleen een server-side proces zonder sessie, of een beheerder die de taak
  -- handmatig aanzet vanuit het beheer.
  if not (is_admin() or auth.uid() is null) then
    raise exception 'Alleen een beheerder kan de opschoontaak uitvoeren'
      using errcode = 'insufficient_privilege';
  end if;

  -- Contactberichten: 12 maanden. Een vraag van meer dan een jaar geleden is
  -- afgehandeld; het bericht bewaren heeft geen doel meer.
  delete from contact_messages where created_at < now() - interval '12 months';
  get diagnostics v_contactberichten = row_count;

  -- Mailinglog: 12 maanden. Zowel verstuurde mailings als concepten die zijn
  -- blijven liggen.
  delete from mailings where created_at < now() - interval '12 months';
  get diagnostics v_mailings = row_count;

  -- Soft-deleted profielen: na 6 maanden definitief anonimiseren. De
  -- tussenperiode is er zodat een per ongeluk gedeactiveerd account nog terug
  -- kan; daarna vervalt die reden.
  v_profielen := 0;
  for v_profiel in
    select id from profiles
     where deleted_at is not null
       and deleted_at < now() - interval '6 months'
       -- Al geanonimiseerd? Dan overslaan; het e-mailadres verraadt dat.
       and email not like 'verwijderd+%@yogacompanie.invalid'
  loop
    perform anonimiseer_profiel(v_profiel.id);
    v_profielen := v_profielen + 1;
  end loop;

  -- Audit log: 24 maanden. Als laatste, zodat de regels die de handelingen
  -- hierboven vastleggen niet in dezelfde beurt weer verdwijnen.
  delete from audit_log where created_at < now() - interval '24 months';
  get diagnostics v_auditregels = row_count;

  return jsonb_build_object(
    'contactberichten', v_contactberichten,
    'mailings', v_mailings,
    'profielen', v_profielen,
    'auditregels', v_auditregels
  );
end;
$$;

comment on function opruimen_bewaartermijnen is
  'Voert de bewaartermijnen uit BOUWPROMPT §17.6 uit. Zie docs/avg.md.';

revoke all on function opruimen_bewaartermijnen from public;
grant execute on function opruimen_bewaartermijnen to authenticated;
