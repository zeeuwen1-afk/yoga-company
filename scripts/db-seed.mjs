#!/usr/bin/env node
/**
 * Laadt `supabase/seed.sql` in de database uit SUPABASE_DB_URL.
 *
 * De seed is herhaalbaar: bestaande rijen worden bijgewerkt op slug of sleutel,
 * dus twee keer draaien levert geen dubbele cursussen op.
 *
 *   pnpm db:seed
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error(
    "SUPABASE_DB_URL ontbreekt. Zet hem in .env.local (zie .env.example).",
  );
  process.exit(1);
}

const sql = await readFile(
  path.join(process.cwd(), "supabase", "seed.sql"),
  "utf8",
);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

try {
  // In één transactie: gaat er iets mis, dan blijft de database zoals hij was.
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log("supabase/seed.sql ingeladen.");
} catch (fout) {
  await client.query("rollback");
  console.error(`Seed mislukt: ${fout.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
