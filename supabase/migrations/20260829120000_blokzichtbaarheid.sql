-- =============================================================================
-- Zichtbaarheid per CMS-blok
--
-- Tot nu toe kende een blok twee toestanden: gepubliceerd en concept. Wat er
-- niet was, is "even niet tonen". Een beheerder kon de tekst van een blok
-- wijzigen maar het blok niet wegnemen — en juist dat is wat een promobanner
-- vraagt: hij staat er een paar weken, en daarna niet meer.
--
-- De schakelaar volgt dezelfde weg als de rest van de editor: hij gaat eerst
-- naar `draft_zichtbaar` en komt pas bij publiceren in `zichtbaar` terecht.
-- Anders zou één klik meteen op de site staan terwijl de tekst ernaast nog als
-- concept wacht, en dat is precies de verwarring die concept-en-publiceren
-- hoort te voorkomen.
-- =============================================================================

alter table content_blocks
  add column zichtbaar boolean not null default true,
  add column draft_zichtbaar boolean;

comment on column content_blocks.zichtbaar is
  'Staat dit blok online? Onzichtbaar betekent: de sectie verdwijnt van de pagina, de inhoud blijft bewaard.';

comment on column content_blocks.draft_zichtbaar is
  'De schakelaar in concept. Leeg betekent: geen wijziging ten opzichte van `zichtbaar`.';

-- -----------------------------------------------------------------------------
-- De publieke view geeft de vlag mee — en houdt de inhoud van een verborgen
-- blok binnen.
--
-- Twee dingen tegelijk. De rij moet blijven bestaan, want de publieke pagina
-- begint bij de startinhoud uit de code en legt daar de database overheen;
-- viel de rij weg, dan kwam de startinhoud er weer voor in de plaats en stond
-- het blok alsnog op de site. Maar de waarde gaat er niet in mee: wat niet
-- getoond wordt, hoeft ook niet over de lijn. Een aankondiging die volgende
-- maand pas mag, staat anders vandaag al in de API.
--
-- De view wordt opnieuw aangemaakt in plaats van vervangen: er komt een kolom
-- tussen, en `create or replace view` staat alleen toevoegen aan het eind toe.
-- -----------------------------------------------------------------------------
drop view content_blocks_public;

create view content_blocks_public
with (security_invoker = false) as
select
  page_key,
  block_key,
  kind,
  case when zichtbaar then value else null end as value,
  zichtbaar,
  updated_at
from content_blocks;

comment on view content_blocks_public is
  'Gepubliceerde CMS-inhoud voor de publieke site. Bevat nooit concepten, en nooit de inhoud van een verborgen blok.';

grant select on content_blocks_public to anon, authenticated;
