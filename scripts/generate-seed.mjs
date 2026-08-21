#!/usr/bin/env node
/**
 * Schrijft `supabase/seed.sql` op basis van de inhoud in `src/content/`.
 *
 * Eén bron van waarheid: de site valt terug op diezelfde bestanden zolang de
 * database nog leeg is, dus seed en terugval kunnen niet uiteenlopen.
 *
 *   pnpm db:generate-seed
 *
 * De seed is herhaalbaar: bestaande rijen worden bijgewerkt, niet gedupliceerd.
 * Aanpassingen die de admin later via de beheeromgeving maakt, worden door een
 * herhaalde seed wél overschreven — draai hem dus alleen bij het opzetten.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

// De inhoud staat in TypeScript; Node 24 voert die rechtstreeks uit door de
// types eruit te strippen. Daarom importeren de contentbestanden elkaar mét
// bestandsextensie en zonder pad-alias.
const { AANBOD } = await import("../src/content/aanbod.ts");
const { BLOKKEN } = await import("../src/content/blokken.ts");
const { STUDIO, PRODUCTEN } = await import("../src/content/tarieven.ts");

/** SQL-tekstwaarde, veilig ontsnapt. */
const q = (waarde) =>
  waarde === null || waarde === undefined
    ? "null"
    : `'${String(waarde).replaceAll("'", "''")}'`;

const json = (waarde) =>
  waarde === null || waarde === undefined
    ? "null"
    : `'${JSON.stringify(waarde).replaceAll("'", "''")}'::jsonb`;

const regels = [];

regels.push(`-- =============================================================================
-- YogaCompany — startinhoud (BOUWPROMPT §19)
--
-- GEGENEREERD BESTAND. Niet met de hand aanpassen.
-- Wijzig de inhoud in src/content/ en draai: pnpm db:generate-seed
--
-- Herhaalbaar: bestaande rijen worden bijgewerkt op slug of sleutel.
-- =============================================================================
`);

// -----------------------------------------------------------------------------
// Aanbod
// -----------------------------------------------------------------------------
regels.push(
  "-- Opleidingen en trainingen -------------------------------------------------",
);

for (const cursus of AANBOD) {
  regels.push(`
insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  ${q(cursus.type)}, ${q(cursus.titel)}, ${q(cursus.slug)},
  ${q(cursus.samenvatting)}, ${q(cursus.beschrijving)},
  ${q(cursus.voorWie)}, ${q(cursus.toelatingseisen)},
  ${json(cursus.curriculum)},
  ${q(cursus.studiebelasting)}, ${q(cursus.locatie)},
  ${cursus.maxDeelnemers ?? "null"}, ${q(cursus.certificaat)},
  ${cursus.prijsCenten}, ${cursus.digitaleContent}, true, ${cursus.sort}
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;`);
}

// -----------------------------------------------------------------------------
// Digitale content (alleen waar die er is)
// -----------------------------------------------------------------------------
const metLesmateriaal = AANBOD.filter((cursus) => cursus.lesmateriaal?.length);

if (metLesmateriaal.length > 0) {
  regels.push(`
-- Digitale content ----------------------------------------------------------
-- De bestandspaden verwijzen naar de bucket 'protected-content'. De bestanden
-- zelf uploadt de admin via de beheeromgeving; tot die tijd staat de structuur
-- klaar zonder dat er iets af te spelen valt.`);

  for (const cursus of metLesmateriaal) {
    for (const [moduleIndex, module] of cursus.lesmateriaal.entries()) {
      const moduleVar = `mod_${cursus.slug.replaceAll("-", "_")}_${moduleIndex}`;

      regels.push(`
do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = ${q(cursus.slug)};

  select id into v_module from course_modules
   where course_id = v_course and title = ${q(module.titel)};

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, ${q(module.titel)}, ${moduleIndex})
    returning id into v_module;
  end if;`);

      for (const [lesIndex, les] of module.lessen.entries()) {
        regels.push(`
  select id into v_lesson from lessons
   where module_id = v_module and title = ${q(les.titel)};

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, ${q(les.titel)}, ${lesIndex})
    returning id into v_lesson;
  end if;`);

        for (const [itemIndex, item] of les.items.entries()) {
          regels.push(`
  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = ${q(item.titel)}
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, ${q(item.kind)}, ${q(item.titel)}, ${q(item.body ?? null)},
            ${q(item.storage_path ?? null)}, ${item.is_preview ?? false}, ${itemIndex});
  end if;`);
        }
      }

      regels.push(`end
$seed$;
-- ${moduleVar}`);
    }
  }
}

// -----------------------------------------------------------------------------
// Studio en producten (docentenlaag)
//
// Vaste id's, zodat een herhaalde seed dezelfde rijen bijwerkt in plaats van
// er nieuwe naast te zetten. De bedragen komen uit dezelfde lijst als de
// tarievenpagina; `tarieven.test.ts` bewaakt dat die twee gelijk blijven.
// -----------------------------------------------------------------------------
const nul = (waarde) =>
  waarde === null || waarde === undefined ? "null" : waarde;

regels.push(`
-- Studio en producten -------------------------------------------------------

insert into studios (id, naam, plaats, max_deelnemers)
values (${q(STUDIO.id)}, ${q(STUDIO.naam)}, ${q(STUDIO.plaats)}, ${STUDIO.max_deelnemers})
on conflict (id) do update set
  naam = excluded.naam,
  plaats = excluded.plaats,
  max_deelnemers = excluded.max_deelnemers;`);

for (const [index, product] of PRODUCTEN.entries()) {
  regels.push(`
insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  ${q(product.id)}, ${q(STUDIO.id)}, ${q(product.naam)},
  ${nul(product.aantal_lessen)}, ${product.prijs_centen},
  ${nul(product.verrekenwaarde_centen)}, ${nul(product.geldigheid_dagen)},
  ${product.uitloop_dagen}, ${product.kruisgebruik_toegestaan},
  ${nul(product.max_kruislessen_per_maand)}, ${index}
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;`);
}

// -----------------------------------------------------------------------------
// CMS-blokken
// -----------------------------------------------------------------------------
regels.push(`
-- CMS-blokken ---------------------------------------------------------------
-- De publieke site leest uitsluitend 'value'; 'draft_value' blijft leeg tot
-- iemand in de site-editor een concept maakt (BOUWPROMPT §14).`);

for (const blok of BLOKKEN) {
  regels.push(`
insert into content_blocks (page_key, block_key, kind, value)
values (${q(blok.page_key)}, ${q(blok.block_key)}, ${q(blok.kind)}, ${json(blok.value)})
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;`);
}

const doel = path.join(process.cwd(), "supabase", "seed.sql");
await writeFile(doel, regels.join("\n") + "\n", "utf8");

console.log(
  `supabase/seed.sql geschreven — ${AANBOD.length} cursussen, ${BLOKKEN.length} CMS-blokken.`,
);
