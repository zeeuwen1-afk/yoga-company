-- Vrije blokken onder aan een pagina van de site.
--
-- De structuur van de publieke pagina's ligt vast in code: de hero, de drie
-- ingangen en het rooster hebben elk hun eigen ontwerp, en dat is precies wat
-- de site zijn gezicht geeft. Wat er niet was, is ruimte om er zelf iets onder
-- te zetten: een extra tekst, een foto met een verhaal, een oproep.
--
-- Deze tabel is die ruimte. Hij is bewust gemodelleerd naar `docent_blokken`,
-- dat sinds augustus draait: dezelfde velden, dezelfde concept-kolommen,
-- dezelfde manier van publiceren. Twee keer een ander model voor hetzelfde
-- probleem is hoe een project onbegrijpelijk wordt.
--
-- Concept en gepubliceerd staan naast elkaar in één rij. Een blok dat nog nooit
-- is gepubliceerd heeft `volgorde is null`; daarmee is de publieke query één
-- voorwaarde en hoeft er niets te worden gekopieerd bij het publiceren.

create table pagina_blokken (
  id uuid primary key default gen_random_uuid(),
  -- De pagina waar dit blok onder komt. Geen verwijzing naar een tabel: de
  -- pagina's staan in code, niet in de database.
  page_key text not null,
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
  updated_at timestamptz not null default now(),
  constraint pagina_blokken_type check (
    type in ('tekst', 'tekst_beeld', 'beeld', 'fotoreeks', 'oproep')
  ),
  constraint pagina_blokken_volgorde check (volgorde is null or volgorde > 0),
  constraint pagina_blokken_concept_volgorde
    check (concept_volgorde is null or concept_volgorde > 0)
);

create index pagina_blokken_pagina_idx on pagina_blokken (page_key, volgorde);

alter table pagina_blokken enable row level security;

-- De bezoeker ziet alleen wat is gepubliceerd én aan staat. Een blok dat nog
-- in concept staat heeft geen volgorde en valt daarmee vanzelf buiten deze
-- voorwaarde; er is geen tweede tabel of een vlaggetje voor nodig.
create policy "vrij blok: gepubliceerd is openbaar"
  on pagina_blokken for select to anon, authenticated
  using (volgorde is not null and zichtbaar);

-- Beheren mag alleen de admin. Anders dan bij een docentpagina is er hier geen
-- eigenaar per rij: dit is de site zelf.
create policy "vrij blok: admin beheert"
  on pagina_blokken for all to authenticated
  using (is_admin()) with check (is_admin());

-- Dezelfde vorm als bij content_blocks: elke tabel heeft zijn eigen kleine
-- functie, zodat je bij het lezen van een trigger meteen ziet wat hij doet.
create or replace function touch_pagina_blok_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger pagina_blokken_touch_updated_at
  before update on pagina_blokken
  for each row execute function touch_pagina_blok_updated_at();
