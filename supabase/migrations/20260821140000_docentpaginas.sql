-- =============================================================================
-- YogaCompany — een eigen landingspagina per docent
--
-- Elke docent met een lopend abonnement krijgt een pagina op /docent/{slug} die
-- hij zelf indeelt: tekst, foto's en de volgorde van de blokken.
--
-- Waarom dit een aparte laag is en geen uitbreiding van `content_blocks`
-- ---------------------------------------------------------------------
-- In `src/content/blokken.ts` staat: "De structuur van een pagina ligt vast in
-- code; alleen de inhoud van de blokken is bewerkbaar." Dat is geen toeval maar
-- de reden dat de studio-pagina's niet half kunnen breken door een verkeerde
-- klik. Voor een docentenpagina geldt het omgekeerde: daar ís de volgorde
-- inhoud. Die twee soorten pagina's staan daarom naast elkaar en niet door
-- elkaar heen.
--
-- Vrij, maar niet onbegrensd: de bloktypen liggen vast in code. Een docent
-- kiest eruit, zet ze op volgorde en verbergt wat hij niet wil. Hij kan geen
-- eigen HTML plaatsen en geen bloktype verzinnen dat de pagina niet kent.
--
-- Wat het abonnement wél en niet afsluit
-- --------------------------------------
-- Het abonnement bepaalt of iemand een etalage heeft en of hij nieuwe kaarten
-- mag uitgeven. Het sluit uitdrukkelijk NIET de verrekening af: een docent die
-- stopt met betalen moet zijn openstaande maand nog kunnen afsluiten en zijn
-- facturen kunnen versturen. Dat geld is van hem en komt van een derde; dat
-- houd je niet tegen omdat er een rekening bij jóú openstaat.
--
-- En reeds verkochte kaarten blijven werken. Die klant heeft betaald, en niet
-- aan het platform. Zijn strippen mogen niet vervallen omdat zijn docent een
-- abonnement liet lopen.
-- =============================================================================

create type docent_pagina_status as enum ('concept', 'gepubliceerd');

-- -----------------------------------------------------------------------------
-- 1. Instellingen van het platform
--
-- Het abonnementsbedrag moet te wijzigen zijn zonder uitrol, dus het staat in
-- de database. Maar het moet óók bevriezen: verhoog je volgend jaar naar € 30,
-- dan mag een lopende afspraak niet meeveranderen. Vandaar deze tabel voor het
-- huidige standaardtarief, en een kopie ervan op elk abonnement.
-- -----------------------------------------------------------------------------
create table platform_instellingen (
  sleutel text primary key,
  waarde text not null,
  omschrijving text not null,
  updated_at timestamptz not null default now()
);

create trigger platform_instellingen_touch_updated_at
  before update on platform_instellingen
  for each row execute function touch_updated_at();

insert into platform_instellingen (sleutel, waarde, omschrijving)
values (
  'docentabonnement_centen',
  '2500',
  'Wat een docent per maand betaalt voor de docentenlaag. Nieuwe abonnementen nemen dit bedrag over; lopende abonnementen houden het bedrag dat gold toen ze begonnen.'
)
on conflict (sleutel) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Het abonnement krijgt geheugen
-- -----------------------------------------------------------------------------
alter table teacher_subscriptions
  -- Wat het standaardtarief was toen dit abonnement begon. Bewaard zodat je
  -- later kunt verklaren waarom deze docent een ander bedrag betaalt.
  add column bron_instelling_centen int,
  -- Tot wanneer de pagina online blijft nadat het abonnement is gestopt.
  -- Dertig dagen, zodat een link op iemands Instagram niet van de ene op de
  -- andere dag doodvalt.
  add column respijt_tot date;

comment on column teacher_subscriptions.respijt_tot is
  'Tot deze datum blijft de pagina online terwijl bewerken al is gestopt.';

-- -----------------------------------------------------------------------------
-- 3. Mag deze docent bewerken, en mag zijn pagina online staan?
--
-- Twee vragen, twee antwoorden. Bewerken stopt meteen; de pagina blijft nog
-- dertig dagen staan. Allebei `security definer`, want ze worden aangeroepen
-- vanuit policies op tabellen die ook een anonieme bezoeker leest.
-- -----------------------------------------------------------------------------
create or replace function heeft_abonnement(p_profile_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from teacher_subscriptions
    where profile_id = p_profile_id
      and actief
      and ingangsdatum <= current_date
      and (opzegdatum is null or opzegdatum >= current_date)
  );
$$;

comment on function heeft_abonnement is
  'True bij een lopend abonnement. Bepaalt of iemand mag bewerken en nieuwe kaarten mag uitgeven — nooit of bestaande kaarten blijven werken.';

create or replace function pagina_mag_online(p_profile_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select heeft_abonnement(p_profile_id)
      or exists (
        select 1 from teacher_subscriptions
        where profile_id = p_profile_id
          and respijt_tot is not null
          and respijt_tot >= current_date
      );
$$;

comment on function pagina_mag_online is
  'True zolang het abonnement loopt óf het respijt van dertig dagen nog niet voorbij is.';

grant execute on function heeft_abonnement(uuid) to anon, authenticated;
grant execute on function pagina_mag_online(uuid) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. De pagina
-- -----------------------------------------------------------------------------
create table docent_paginas (
  profile_id uuid primary key references profiles (id) on delete cascade,
  -- Komt op visitekaartjes en in Instagram-bio's te staan. Daarom streng in de
  -- vorm, uniek, en met een lijst woorden die het pad zouden kapen.
  slug text not null unique,
  seo_titel text,
  seo_omschrijving text,
  status docent_pagina_status not null default 'concept',
  gepubliceerd_op timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint docent_paginas_slug_vorm
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 60),
  constraint docent_paginas_slug_niet_gereserveerd check (
    slug not in (
      'nieuw', 'admin', 'portaal', 'docenten', 'docent', 'onze-docenten',
      'pagina', 'voorbeeld', 'api', 'lessen', 'tarieven', 'contact',
      'inloggen', 'registreren', 'over-ons', 'veiligheid'
    )
  )
);

create trigger docent_paginas_touch_updated_at
  before update on docent_paginas
  for each row execute function touch_updated_at();

-- Een oud adres blijft doorverwijzen. Zonder dit breekt elke gedeelde link op
-- het moment dat iemand zijn slug wijzigt.
create table docent_slug_historie (
  slug text primary key,
  profile_id uuid not null references profiles (id) on delete cascade,
  vervangen_op timestamptz not null default now()
);

create index docent_slug_historie_profiel_idx on docent_slug_historie (profile_id);

-- -----------------------------------------------------------------------------
-- 5. De blokken
--
-- `volgorde` leeg betekent: bestaat alleen als concept en is publiek nooit
-- zichtbaar. Zo hoeft een nieuw blok geen apart vlaggetje.
--
-- Op `volgorde` staat bewust géén unieke index. Tijdens het verplaatsen komen
-- twee blokken kortstondig op hetzelfde nummer; publiceren nummert opnieuw
-- door. Een unieke index zou het verplaatsen juist tegenwerken.
-- -----------------------------------------------------------------------------
create table docent_blokken (
  id uuid primary key default gen_random_uuid(),
  pagina_id uuid not null references docent_paginas (profile_id) on delete cascade,
  type text not null,
  volgorde int,
  zichtbaar boolean not null default true,
  inhoud jsonb not null default '{}'::jsonb,
  -- De editor schrijft uitsluitend hierin. De bezoeker ziet het nooit.
  concept_inhoud jsonb,
  concept_volgorde int,
  concept_zichtbaar boolean,
  concept_verwijderd boolean not null default false,
  created_at timestamptz not null default now(),
  constraint docent_blokken_type check (
    type in (
      'kop_portret', 'over_mij', 'tekst', 'beeld', 'citaat', 'video',
      'vraag_antwoord', 'contact', 'mijn_lessen', 'wat_het_kost'
    )
  ),
  constraint docent_blokken_volgorde check (volgorde is null or volgorde > 0),
  constraint docent_blokken_concept_volgorde
    check (concept_volgorde is null or concept_volgorde > 0)
);

create index docent_blokken_pagina_idx on docent_blokken (pagina_id, volgorde);

-- De kop met het portret draagt de naam en de H1 van de pagina. Eén per
-- pagina, en hij mag niet worden verborgen of verplaatst — anders opent de
-- pagina zonder te zeggen van wie hij is.
create unique index docent_blokken_een_kop_idx
  on docent_blokken (pagina_id) where type = 'kop_portret';

-- -----------------------------------------------------------------------------
-- 6. Beeldmateriaal
--
-- Het bestand staat in de bucket `public-media` onder `docent/{profile_id}/`;
-- deze tabel houdt bij wat van wie is, zodat de kiezer in de editor alleen de
-- eigen foto's toont.
-- -----------------------------------------------------------------------------
create table docent_media (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  pad text not null unique,
  bestandsnaam text not null,
  bytes int not null,
  alt text,
  geupload_op timestamptz not null default now(),
  constraint docent_media_bytes check (bytes > 0 and bytes <= 3145728),
  -- Het pad moet in de eigen map van deze docent liggen. De storage-policy
  -- bewaakt hetzelfde bij het uploaden; dit bewaakt de administratie erover.
  constraint docent_media_pad_in_eigen_map
    check (pad like 'docent/' || profile_id::text || '/%')
);

create index docent_media_profiel_idx on docent_media (profile_id, geupload_op desc);

-- -----------------------------------------------------------------------------
-- 7. Row Level Security
-- -----------------------------------------------------------------------------
alter table platform_instellingen enable row level security;
alter table docent_paginas enable row level security;
alter table docent_slug_historie enable row level security;
alter table docent_blokken enable row level security;
alter table docent_media enable row level security;

create policy "instelling: leesbaar voor ingelogden"
  on platform_instellingen for select to authenticated using (true);
create policy "instelling: admin beheert"
  on platform_instellingen for all to authenticated
  using (is_admin()) with check (is_admin());

-- --- De publieke pagina -----------------------------------------------------
-- Twee voorwaarden, allebei nodig: gepubliceerd, én een docent die er recht op
-- heeft. Valt het abonnement weg, dan verdwijnt de pagina vanzelf zodra het
-- respijt voorbij is — zonder dat er iemand iets hoeft te doen.
create policy "docentpagina: gepubliceerd en betaald is openbaar"
  on docent_paginas for select to anon, authenticated
  using (status = 'gepubliceerd' and pagina_mag_online(profile_id));

create policy "docentpagina: de docent zelf"
  on docent_paginas for select to authenticated
  using (profile_id = (select auth.uid()));

-- Bewerken vraagt een lopend abonnement. Tijdens het respijt kan een docent
-- zijn pagina dus wel zien maar niet meer wijzigen.
create policy "docentpagina: eigen pagina bewerken"
  on docent_paginas for update to authenticated
  using (profile_id = (select auth.uid()) and heeft_abonnement((select auth.uid())))
  with check (profile_id = (select auth.uid()));

create policy "docentpagina: eigen pagina aanmaken"
  on docent_paginas for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and is_docent()
    and heeft_abonnement((select auth.uid()))
  );

create policy "docentpagina: admin doet alles"
  on docent_paginas for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "slughistorie: openbaar leesbaar"
  on docent_slug_historie for select to anon, authenticated using (true);
create policy "slughistorie: admin beheert"
  on docent_slug_historie for all to authenticated
  using (is_admin()) with check (is_admin());

-- --- De blokken -------------------------------------------------------------
-- De bezoeker ziet alleen blokken die echt gepubliceerd zijn: `volgorde` moet
-- gevuld zijn (anders bestaat het blok alleen als concept) en `zichtbaar` moet
-- aanstaan. De conceptkolommen komen nooit mee, want de publieke pagina vraagt
-- ze niet op — en al deed ze dat, dan nog hoort deze policy de rij te tonen
-- zoals hij gepubliceerd is.
create policy "docentblok: gepubliceerde blokken van een zichtbare pagina"
  on docent_blokken for select to anon, authenticated
  using (
    volgorde is not null
    and zichtbaar
    and not concept_verwijderd
    and exists (
      select 1 from docent_paginas p
      where p.profile_id = docent_blokken.pagina_id
        and p.status = 'gepubliceerd'
        and pagina_mag_online(p.profile_id)
    )
  );

create policy "docentblok: de docent zelf"
  on docent_blokken for select to authenticated
  using (pagina_id = (select auth.uid()));

-- Schrijven kan alleen op de eigen pagina, en alleen met een lopend
-- abonnement. `pagina_id` is gelijk aan het profiel-id van de docent; een
-- blok toevoegen aan de pagina van een collega loopt daarmee stuk op de
-- `with check`.
create policy "docentblok: eigen blokken beheren"
  on docent_blokken for all to authenticated
  using (
    pagina_id = (select auth.uid()) and heeft_abonnement((select auth.uid()))
  )
  with check (
    pagina_id = (select auth.uid()) and heeft_abonnement((select auth.uid()))
  );

create policy "docentblok: admin doet alles"
  on docent_blokken for all to authenticated
  using (is_admin()) with check (is_admin());

-- --- Beeldmateriaal ---------------------------------------------------------
create policy "docentmedia: openbaar leesbaar"
  on docent_media for select to anon, authenticated using (true);

create policy "docentmedia: eigen beeld beheren"
  on docent_media for all to authenticated
  using (
    profile_id = (select auth.uid()) and heeft_abonnement((select auth.uid()))
  )
  with check (
    profile_id = (select auth.uid()) and heeft_abonnement((select auth.uid()))
  );

create policy "docentmedia: admin doet alles"
  on docent_media for all to authenticated
  using (is_admin()) with check (is_admin());

-- --- Opslag -----------------------------------------------------------------
-- Zelfde vorm als de policy op `avatars`, die dit patroon al bewijst: het
-- eerste mapniveau is 'docent', het tweede het eigen profiel-id. Zonder dit
-- kan docent A het bestand van docent B overschrijven door een foto met
-- dezelfde naam te uploaden.
create policy "docentbeeld: eigen map beheren"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = 'docent'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = 'docent'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

grant select on docent_paginas, docent_blokken, docent_media, docent_slug_historie
  to anon, authenticated;
grant insert, update, delete on docent_paginas, docent_blokken, docent_media
  to authenticated;
grant select on platform_instellingen to authenticated;

-- -----------------------------------------------------------------------------
-- 8. Nieuwe kaarten uitgeven vraagt nu een abonnement
--
-- Let op wat hier NIET staat: bestaande kaarten blijven gewoon werken.
-- `boek_les` kijkt niet naar het abonnement van de uitgever, en dat is met
-- opzet. Een klant die een tienrittenkaart heeft gekocht mag zijn strippen niet
-- kwijtraken omdat zijn docent een rekening bij ons liet lopen; hij heeft aan
-- die docent betaald, niet aan ons.
-- -----------------------------------------------------------------------------
drop policy "kaart: uitgeven door de docent" on passes;

create policy "kaart: uitgeven door de docent"
  on passes for insert to authenticated
  with check (
    uitgevende_docent_id = (select auth.uid())
    and is_docent()
    and heeft_abonnement((select auth.uid()))
  );

-- -----------------------------------------------------------------------------
-- 9. Publiceren
--
-- Kopieert de concepten over de gepubliceerde waarden heen, gooit weg wat als
-- verwijderd is gemarkeerd, en nummert de overgebleven blokken opnieuw door.
-- Dat laatste is de reden dat er geen unieke index op `volgorde` staat: hier
-- wordt de volgorde weer sluitend gemaakt.
-- -----------------------------------------------------------------------------
create or replace function publiceer_docentpagina() returns int
language plpgsql security definer set search_path = public as $$
declare
  v_mij uuid := auth.uid();
  v_aantal int := 0;
begin
  if v_mij is null or not heeft_abonnement(v_mij) then
    raise exception 'Je hebt een lopend abonnement nodig om te publiceren'
      using errcode = 'insufficient_privilege';
  end if;

  if not exists (select 1 from docent_paginas where profile_id = v_mij) then
    raise exception 'Je hebt nog geen pagina' using errcode = 'check_violation';
  end if;

  delete from docent_blokken
   where pagina_id = v_mij and concept_verwijderd;

  update docent_blokken
     set inhoud = coalesce(concept_inhoud, inhoud),
         volgorde = coalesce(concept_volgorde, volgorde),
         zichtbaar = coalesce(concept_zichtbaar, zichtbaar),
         concept_inhoud = null,
         concept_volgorde = null,
         concept_zichtbaar = null
   where pagina_id = v_mij;

  -- Opnieuw doornummeren, zodat er na verplaatsen en weggooien geen gaten of
  -- dubbele nummers overblijven. De kop staat altijd voorop.
  with genummerd as (
    select id,
           row_number() over (
             order by (type <> 'kop_portret'), volgorde nulls last, created_at
           ) as nieuw
      from docent_blokken
     where pagina_id = v_mij and volgorde is not null
  )
  update docent_blokken b
     set volgorde = g.nieuw
    from genummerd g
   where b.id = g.id;

  select count(*) into v_aantal
    from docent_blokken where pagina_id = v_mij and volgorde is not null;

  update docent_paginas
     set status = 'gepubliceerd', gepubliceerd_op = now()
   where profile_id = v_mij;

  return v_aantal;
end;
$$;

revoke execute on function publiceer_docentpagina() from anon, public;
grant execute on function publiceer_docentpagina() to authenticated;
