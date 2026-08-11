#!/usr/bin/env node
/**
 * Draait de RLS-testsuite uit supabase/tests/rls.
 *
 * Twee manieren, dezelfde tests:
 *
 *   pnpm test:rls          lokale wegwerpdatabase (PGlite), geen configuratie
 *   SUPABASE_DB_URL=… …    tegen het echte Supabase-project
 *
 * De lokale variant draait in CI bij elke wijziging. Draai de suite daarnaast
 * minstens één keer tegen het echte project voordat je live gaat: de lokale
 * database bootst Supabase na, maar ís het niet.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";

const TESTS_DIR = path.join(process.cwd(), "supabase", "tests", "rls");
const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const BOOTSTRAP = path.join(
  process.cwd(),
  "supabase",
  "tests",
  "bootstrap.sql",
);

const GROEN = "[32m";
const ROOD = "[31m";
const GRIJS = "[90m";
const VET = "[1m";
const RESET = "[0m";

/** Eén verbinding, ongeacht of dat PGlite of een echte Postgres is. */
async function openDatabase() {
  const url = process.env.SUPABASE_DB_URL;

  if (url) {
    const { default: pg } = await import("pg");
    const client = new pg.Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    return {
      soort: "Supabase",
      run: (sql) => client.query(sql),
      sluit: () => client.end(),
      // Tegen het echte project draait alles in één transactie die aan het
      // eind wordt teruggedraaid: er blijft nooit testdata achter.
      wegwerpbaar: false,
    };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite();
  await db.waitReady;
  return {
    soort: "lokaal (PGlite)",
    run: (sql) => db.exec(sql),
    sluit: () => db.close(),
    wegwerpbaar: true,
  };
}

async function main() {
  const db = await openDatabase();
  console.log(`\n${VET}RLS-tests${RESET} — database: ${db.soort}\n`);

  let mislukt = 0;

  try {
    if (db.wegwerpbaar) {
      // Lege database: eerst Supabase nabootsen, dan de echte migrations.
      await db.run(await readFile(BOOTSTRAP, "utf8"));

      const migraties = (await readdir(MIGRATIONS_DIR))
        .filter((naam) => naam.endsWith(".sql"))
        .sort();

      for (const migratie of migraties) {
        await db.run(
          await readFile(path.join(MIGRATIONS_DIR, migratie), "utf8"),
        );
        console.log(`${GRIJS}  migration  ${migratie}${RESET}`);
      }
      console.log("");
    }

    await db.run("begin");
    await db.run(await readFile(path.join(TESTS_DIR, "_helpers.sql"), "utf8"));
    await db.run(await readFile(path.join(TESTS_DIR, "_fixtures.sql"), "utf8"));

    const testbestanden = (await readdir(TESTS_DIR))
      .filter((naam) => naam.endsWith(".sql") && !naam.startsWith("_"))
      .sort();

    for (const bestand of testbestanden) {
      await db.run("savepoint test_start");
      try {
        await db.run(await readFile(path.join(TESTS_DIR, bestand), "utf8"));
        console.log(`${GROEN}  ✓${RESET} ${bestand}`);
      } catch (fout) {
        mislukt += 1;
        console.log(`${ROOD}  ✗ ${bestand}${RESET}`);
        console.log(`${GRIJS}    ${fout.message.split("\n")[0]}${RESET}`);
        await db.run("rollback to savepoint test_start");
      }
      // Rol altijd terugzetten: een test die halverwege faalt laat anders de
      // rol van een testgebruiker achter voor de volgende test.
      await db.run("reset role");
      await db.run("release savepoint test_start");
    }

    await db.run("rollback");
  } catch (fout) {
    mislukt += 1;
    console.error(`\n${ROOD}Opzet van de tests mislukte:${RESET}`);
    console.error(fout.message);
  } finally {
    await db.sluit();
  }

  if (mislukt > 0) {
    console.log(`\n${ROOD}${mislukt} onderdeel(en) gefaald.${RESET}\n`);
    process.exit(1);
  }

  console.log(`\n${GROEN}Alle RLS-tests geslaagd.${RESET}\n`);
}

await main();
