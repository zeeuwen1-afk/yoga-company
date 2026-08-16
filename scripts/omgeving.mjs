/**
 * Laadt de omgevingsvariabelen voor de scripts in deze map.
 *
 * Waarom niet gewoon `import "dotenv/config"`? Omdat dat alléén `.env` leest,
 * en dit project zijn sleutels in `.env.local` heeft staan — zoals Next.js dat
 * ook doet, en zoals `.env.example` en elke foutmelding hier het zeggen. Het
 * gevolg was dat `pnpm db:seed` meldde dat SUPABASE_DB_URL ontbrak terwijl hij
 * netjes ingevuld was. Dat is nooit opgevallen omdat deze scripts tot nu toe
 * nooit met een gevulde waarde hadden gedraaid.
 *
 * Dezelfde volgorde als Next.js: wat al in de omgeving staat wint (zo kan CI
 * of een eenmalige aanroep het overschrijven), daarna `.env.local`, dan `.env`.
 */
import { existsSync } from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

for (const bestand of [".env.local", ".env"]) {
  const pad = path.join(process.cwd(), bestand);
  // `override: false` is de standaard: een variabele die er al is blijft staan.
  if (existsSync(pad)) dotenv.config({ path: pad, quiet: true });
}
