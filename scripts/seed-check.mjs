#!/usr/bin/env node
/**
 * Controleert dat `supabase/seed.sql` daadwerkelijk draait en oplevert wat
 * ervan verwacht wordt.
 *
 * De seed is gegenereerde SQL. Zonder deze controle zou een fout er pas
 * uitkomen op het moment dat je hem tegen het echte project draait — precies
 * het verkeerde moment. Draait hier tegen een wegwerpdatabase (PGlite).
 *
 *   pnpm db:check-seed
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";

const ROOT = process.cwd();
const GROEN = "[32m";
const ROOD = "[31m";
const RESET = "[0m";

const {
  AANBOD,
  MODULE_PRIJS_CENTEN,
  OPLEIDING_PRIJS_CENTEN,
  OPLEIDING_KORTING_CENTEN,
} = await import("../src/content/aanbod.ts");
const { BLOKKEN } = await import("../src/content/blokken.ts");
const { STUDIO, PRODUCTEN } = await import("../src/content/tarieven.ts");

const db = new PGlite();
await db.waitReady;

let mislukt = 0;

function controleer(voorwaarde, omschrijving) {
  if (voorwaarde) {
    console.log(`${GROEN}  ✓${RESET} ${omschrijving}`);
  } else {
    mislukt += 1;
    console.log(`${ROOD}  ✗ ${omschrijving}${RESET}`);
  }
}

try {
  await db.exec(
    await readFile(
      path.join(ROOT, "supabase", "tests", "bootstrap.sql"),
      "utf8",
    ),
  );

  const migraties = (await readdir(path.join(ROOT, "supabase", "migrations")))
    .filter((naam) => naam.endsWith(".sql"))
    .sort();

  for (const migratie of migraties) {
    await db.exec(
      await readFile(
        path.join(ROOT, "supabase", "migrations", migratie),
        "utf8",
      ),
    );
  }

  // Twee keer draaien: de seed hoort herhaalbaar te zijn.
  const seed = await readFile(path.join(ROOT, "supabase", "seed.sql"), "utf8");
  await db.exec(seed);
  await db.exec(seed);

  const tel = async (sql) => {
    const uitkomst = await db.query(sql);
    return Number(uitkomst.rows[0].n);
  };

  const cursussen = await tel("select count(*)::int as n from courses");
  controleer(
    cursussen === AANBOD.length,
    `${AANBOD.length} cursussen ingeladen (gevonden: ${cursussen}) — geen duplicaten na tweemaal draaien`,
  );

  const blokken = await tel("select count(*)::int as n from content_blocks");
  controleer(
    blokken === BLOKKEN.length,
    `${BLOKKEN.length} CMS-blokken ingeladen (gevonden: ${blokken})`,
  );

  // --- Studio en producten (docentenlaag) ------------------------------------
  const producten = await tel("select count(*)::int as n from pass_products");
  controleer(
    producten === PRODUCTEN.length,
    `${PRODUCTEN.length} producten ingeladen (gevonden: ${producten})`,
  );

  const studiomax = await tel(
    "select max_deelnemers::int as n from studios where naam = 'Rinske Yoga Almere'",
  );
  controleer(
    studiomax === STUDIO.max_deelnemers,
    `de studio heeft plaats voor ${STUDIO.max_deelnemers} (gevonden: ${studiomax})`,
  );

  // Elk product dat bij een collega mag worden gebruikt heeft een bedrag om te
  // factureren; zonder dat ontstaat er een afboeking zonder waarde. De
  // database dwingt het af, maar hier zie je het meteen.
  const zonderWaarde = await tel(
    `select count(*)::int as n from pass_products
      where kruisgebruik_toegestaan and verrekenwaarde_centen is null`,
  );
  controleer(
    zonderWaarde === 0,
    `elk product met kruisgebruik heeft een verrekenwaarde (zonder: ${zonderWaarde})`,
  );

  const tienstrip = await tel(
    `select verrekenwaarde_centen::int as n from pass_products
      where naam = '10-strippenkaart'`,
  );
  controleer(
    tienstrip === 1330,
    `de 10-strippenkaart verrekent op € 13,30 excl. btw (gevonden: ${tienstrip})`,
  );

  const hoofdopleiding = await db.query(
    "select title, price_cents, jsonb_array_length(curriculum) as modules from courses where slug = '200-uurs-yin-yoga-specialist'",
  );
  const rij = hoofdopleiding.rows[0];
  const euro = (centen) => `€ ${(centen / 100).toLocaleString("nl-NL")}`;
  controleer(
    rij?.price_cents === OPLEIDING_PRIJS_CENTEN,
    `de 200-uurs opleiding staat op ${euro(OPLEIDING_PRIJS_CENTEN)} (gevonden: ${rij?.price_cents})`,
  );
  controleer(
    Number(rij?.modules) === 4,
    `het curriculum telt vier modules (gevonden: ${rij?.modules})`,
  );

  const losseModules = await db.query(
    "select price_cents from courses where slug like 'yin-niveau-%'",
  );
  controleer(
    losseModules.rows.length === 4,
    `de vier losse modules staan er (gevonden: ${losseModules.rows.length})`,
  );
  const afwijkendePrijs = losseModules.rows.filter(
    (module) => module.price_cents !== MODULE_PRIJS_CENTEN,
  );
  controleer(
    afwijkendePrijs.length === 0,
    `elke losse module staat op ${euro(MODULE_PRIJS_CENTEN)} (afwijkend: ${afwijkendePrijs.length})`,
  );

  // §7.1 van de bouwprompt belooft de bezoeker een voordeel op de bundel. Dat
  // klopt alleen zolang vier losse modules samen duurder zijn dan de opleiding.
  const samenLos = losseModules.rows.reduce(
    (totaal, module) => totaal + module.price_cents,
    0,
  );
  controleer(
    samenLos - OPLEIDING_PRIJS_CENTEN === OPLEIDING_KORTING_CENTEN &&
      OPLEIDING_KORTING_CENTEN > 0,
    `de bundel scheelt ${euro(OPLEIDING_KORTING_CENTEN)} ten opzichte van vier losse modules (gevonden: ${euro(samenLos - OPLEIDING_PRIJS_CENTEN)})`,
  );

  const eerstJijWeken = await tel(`
    select count(*)::int as n from course_modules m
    join courses c on c.id = m.course_id
    where c.slug = 'eerst-jij'`);
  controleer(
    eerstJijWeken === 8,
    `Eerst Jij heeft acht weken (gevonden: ${eerstJijWeken})`,
  );

  const eerstJijItems = await tel(`
    select count(*)::int as n from content_items i
    join lessons l on l.id = i.lesson_id
    join course_modules m on m.id = l.module_id
    join courses c on c.id = m.course_id
    where c.slug = 'eerst-jij'`);
  controleer(
    eerstJijItems === 24,
    `Eerst Jij heeft 24 lesonderdelen, drie per week (gevonden: ${eerstJijItems})`,
  );

  // De publieke view mag nooit concepten tonen.
  const publiek = await tel(
    "select count(*)::int as n from content_blocks_public where value is not null",
  );
  controleer(
    publiek === BLOKKEN.length,
    "alle blokken zijn gepubliceerd en zichtbaar via de publieke view",
  );

  const concepten = await tel(
    "select count(*)::int as n from content_blocks where draft_value is not null",
  );
  controleer(concepten === 0, "de seed laat geen concepten achter");
} catch (fout) {
  mislukt += 1;
  console.error(`${ROOD}\nSeed mislukte:${RESET}`);
  console.error(fout.message);
} finally {
  await db.close();
}

if (mislukt > 0) {
  console.log(`\n${ROOD}${mislukt} controle(s) gefaald.${RESET}\n`);
  process.exit(1);
}

console.log(
  `\n${GROEN}De seed draait en levert de verwachte inhoud.${RESET}\n`,
);
