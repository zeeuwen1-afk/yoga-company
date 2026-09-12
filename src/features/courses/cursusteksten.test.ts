import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { BLOKKEN } from "@/content/blokken";
import { SOORT_INFO, SOORTEN } from "@/content/soorten";

/**
 * Elke tekst die de cursuspagina uit de editor haalt, moet daar ook te vinden
 * zijn.
 *
 * De pagina van een opleiding of training las veertien zinnen uit de code:
 * "Voor wie", "Praktisch", "Twijfel je of dit past?", de knoppen. Ze staan nu
 * als blokken onder de sleutel `cursus`. Het gat dat dan open blijft staan is
 * dit: iemand voegt een nieuwe `pagina.tekst("…")` toe en vergeet het blok. De
 * pagina toont dan stilzwijgend niets — geen fout, geen leeg veld, gewoon een
 * kop die weg is — en de beheerder kan het nergens aanzetten.
 *
 * Daarom leest deze test het component zelf. Een lijst met sleutels naast de
 * code zou na de eerste toevoeging uit elkaar lopen; de code is de enige bron
 * die niet kan verouderen.
 */
describe("de teksten van de cursuspagina", () => {
  const bestand = path.resolve(
    import.meta.dirname,
    "./components/cursus-detail.tsx",
  );
  const bron = readFileSync(bestand, "utf8");

  // Ook de sleutels die achter een keuze staan tellen mee. Daarom eerst het
  // hele argument pakken en daar pas de tekst uit halen.
  const letterlijk = [...bron.matchAll(/pagina\.(?:tekst|html)\(([^)]*)\)/g)]
    .flatMap((aanroep) => [...aanroep[1]!.matchAll(/"([a-z0-9_]+)"/g)])
    .map((treffer) => treffer[1]!);

  // De kruimel terug naar het overzicht verschilt per soort cursus. Die stond
  // als keuze in het component en is sinds workshops een derde soort werden
  // een opzoeking in de soortentabel. De sleutel staat dus niet meer in de
  // bron, maar de bewaking hoort te blijven: elk kruimelveld moet bestaan, en
  // elk kruimelveld moet ergens vandaan gelezen worden.
  const gebruikt = [
    ...letterlijk,
    ...SOORTEN.map((soort) => SOORT_INFO[soort].kruimelBlok),
  ];

  const beschikbaar = new Set(
    BLOKKEN.filter((blok) => blok.page_key === "cursus").map(
      (blok) => blok.block_key,
    ),
  );

  it("leest er genoeg om iets te toetsen", () => {
    // Zonder deze regel zou een mislukte reguliere expressie de test
    // stilzwijgend laten slagen.
    expect(new Set(gebruikt).size).toBeGreaterThan(8);
  });

  it.each([...new Set(gebruikt)])("%s bestaat als blok", (blockKey) => {
    expect(beschikbaar.has(blockKey)).toBe(true);
  });

  it("heeft geen blok dat de pagina nergens toont", () => {
    // Andersom net zo goed: een blok dat de beheerder kan invullen terwijl er
    // niets mee gebeurt is een knop die niets doet.
    const ongebruikt = [...beschikbaar].filter(
      (blockKey) => !gebruikt.includes(blockKey),
    );
    expect(ongebruikt).toEqual([]);
  });
});
