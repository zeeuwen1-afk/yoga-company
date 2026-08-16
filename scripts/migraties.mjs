/**
 * Leest de migrations, en weigert alles wat er niet uitziet als een migration.
 *
 * Waarom die strengheid? Op 16 augustus 2026 stonden er twee bestanden in deze
 * map die er niet hoorden: `… mollie_en_orders 2.sql` en `… klantdossier 2.sql`,
 * kopieën zoals macOS die maakt. Ze waren woordelijk gelijk aan het origineel
 * en zijn per ongeluk meegecommit. Het gevolg: dezelfde migration draaide twee
 * keer, en de tweede keer viel alles om op `type "order_status" already exists`.
 *
 * Dat was nog de vriendelijke uitkomst. Een kopie die niet gelijk is aan het
 * origineel — omdat er tussendoor iets is aangepast — draait er gewoon
 * overheen, en dan wijkt de database af van wat de code denkt. Daarom hier een
 * harde eis aan de naam in plaats van "alles wat op .sql eindigt".
 */
import { readdir } from "node:fs/promises";

/** 14 cijfers, liggend streepje, kleine letters en cijfers, dan .sql */
const PATROON = /^\d{14}_[a-z0-9_]+\.sql$/;

export async function leesMigraties(map) {
  const alles = await readdir(map);
  const sql = alles.filter((naam) => naam.endsWith(".sql"));

  const vreemd = sql.filter((naam) => !PATROON.test(naam));
  if (vreemd.length > 0) {
    throw new Error(
      `Deze bestanden in ${map} zien er niet uit als een migration:\n` +
        vreemd.map((naam) => `  ${naam}`).join("\n") +
        "\n\nEen migration heet <14 cijfers>_<naam met kleine letters>.sql.\n" +
        "Is dit een kopie die per ongeluk is blijven staan? Verwijder hem.",
    );
  }

  return sql.sort();
}
