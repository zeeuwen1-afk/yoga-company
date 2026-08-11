#!/usr/bin/env node
/**
 * Past de migrations uit supabase/migrations toe op de database uit
 * SUPABASE_DB_URL. Bijgehouden in de tabel `schema_migrations`, zodat een
 * migration nooit twee keer draait.
 *
 *   pnpm db:migrate
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import "dotenv/config";
import pg from "pg";

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

function requireDatabaseUrl() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error(
      "SUPABASE_DB_URL ontbreekt. Zet hem in .env.local (zie .env.example).",
    );
    process.exit(1);
  }
  return url;
}

async function main() {
  const client = new pg.Client({
    connectionString: requireDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`
    create table if not exists schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const { rows } = await client.query("select version from schema_migrations");
  const applied = new Set(rows.map((row) => row.version));

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  overgeslagen  ${file}`);
      continue;
    }

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    // Elke migration draait in een eigen transactie: slaagt hij niet, dan
    // blijft de database in de vorige toestand achter.
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into schema_migrations (version) values ($1)",
        [file],
      );
      await client.query("commit");
      console.log(`  toegepast     ${file}`);
      count += 1;
    } catch (error) {
      await client.query("rollback");
      console.error(`\nMigration mislukt: ${file}\n`);
      console.error(error.message);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log(
    count === 0
      ? "\nDatabase was al bij."
      : `\n${count} migration(s) toegepast.`,
  );
}

await main();
