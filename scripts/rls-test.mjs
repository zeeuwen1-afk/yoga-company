#!/usr/bin/env node
/**
 * Draait de RLS-testsuite uit supabase/tests/rls tegen de database.
 *
 * Alles gebeurt in één transactie die aan het eind wordt teruggedraaid: er
 * blijft nooit testdata achter, ook niet als een test faalt.
 *
 *   pnpm test:rls
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";
import pg from "pg";

const TESTS_DIR = path.join(process.cwd(), "supabase", "tests", "rls");

const GROEN = "[32m";
const ROOD = "[31m";
const GRIJS = "[90m";
const RESET = "[0m";

async function readSql(file) {
  return readFile(path.join(TESTS_DIR, file), "utf8");
}

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error(
      "SUPABASE_DB_URL ontbreekt. Zet hem in .env.local (zie .env.example).",
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const testFiles = (await readdir(TESTS_DIR))
    .filter((name) => name.endsWith(".sql") && !name.startsWith("_"))
    .sort();

  let failures = 0;

  await client.query("begin");
  try {
    await client.query(await readSql("_helpers.sql"));
    await client.query(await readSql("_fixtures.sql"));
    // Vanaf hier is de basis gelegd; elke test krijgt een savepoint zodat een
    // falende test de volgende niet meesleept.
    for (const file of testFiles) {
      await client.query("savepoint test_start");
      try {
        await client.query(await readSql(file));
        console.log(`${GROEN}  ✓${RESET} ${file}`);
      } catch (error) {
        failures += 1;
        console.log(`${ROOD}  ✗ ${file}${RESET}`);
        console.log(`${GRIJS}    ${error.message}${RESET}`);
        await client.query("rollback to savepoint test_start");
      }
      await client.query("release savepoint test_start");
    }
  } catch (error) {
    failures += 1;
    console.error(`${ROOD}\nOpzet van de tests mislukte:${RESET}`);
    console.error(error.message);
  } finally {
    // Altijd terugdraaien: de database blijft schoon.
    await client.query("rollback");
    await client.end();
  }

  if (failures > 0) {
    console.log(`\n${ROOD}${failures} RLS-test(s) gefaald.${RESET}`);
    process.exit(1);
  }

  console.log(
    `\n${GROEN}Alle ${testFiles.length} RLS-testbestanden geslaagd.${RESET}`,
  );
}

await main();
