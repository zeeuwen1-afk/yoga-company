import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { isEenRegel } from "./veldsoort";

/**
 * Wat je in het bewerkscherm kunt typen, moet de pagina ook tonen.
 *
 * Dit is twee keer eerder misgegaan, en allebei de keren merkte niemand het
 * tot iemand een tekst probeerde te schrijven. Een veld krijgt een tekstvak,
 * de beheerder zet er alinea's in, en op de pagina staat één doorlopende lap
 * tekst: HTML plakt losse regels aan elkaar tenzij je dat tegenhoudt.
 *
 * De twee kanten staan los van elkaar in de code, dus ze kunnen los van elkaar
 * verlopen. Deze test houdt ze bij elkaar: elk veld dat volgens `veldsoort`
 * ruimte krijgt voor meerdere regels, moet in een element staan dat
 * regelovergangen bewaart. Dat is `whitespace-pre-line`, of de component
 * `Alineas`, die er echte alinea's van maakt.
 *
 * Koppen tellen niet mee: een h1 of h2 is één regel, en de velden die erin
 * staan krijgen in het bewerkscherm ook één regel.
 */

const WORTEL = path.resolve(import.meta.dirname, "../..");
const TAGS = ["p", "span", "dd", "blockquote", "figcaption"];
const BEWAART = ["whitespace-pre-line", "whitespace-pre-wrap"];

function* bronbestanden(map: string): Generator<string> {
  for (const item of readdirSync(map, { withFileTypes: true })) {
    const pad = path.join(map, item.name);
    if (item.isDirectory()) yield* bronbestanden(pad);
    else if (pad.endsWith(".tsx") && !pad.includes(".test.")) yield pad;
  }
}

type Gat = { bestand: string; regel: number; veld: string };

function zoekGaten(): Gat[] {
  const gaten: Gat[] = [];

  for (const pad of bronbestanden(WORTEL)) {
    const bron = readFileSync(pad, "utf8");

    for (const tag of TAGS) {
      // Het binnenste element van deze soort, zodat een lijstitem met een
      // nette paragraaf erin niet als gat wordt geteld.
      const regex = new RegExp(
        `<${tag}(\\s[^>]*)?>((?:(?!<${tag}[\\s>])[\\s\\S])*?)</${tag}>`,
        "g",
      );

      for (const treffer of bron.matchAll(regex)) {
        const attributen = treffer[1] ?? "";
        const inhoud = treffer[2] ?? "";
        if (BEWAART.some((klasse) => attributen.includes(klasse))) continue;

        const velden = [
          ...[...inhoud.matchAll(/pagina\.tekst\("([a-z0-9_]+)"\)/g)].map(
            (m) => m[1]!,
          ),
          ...[
            ...inhoud.matchAll(
              /\{\s*\w+\.(tekst|toelichting|citaat|bio|samenvatting)\s*\}/g,
            ),
          ].map((m) => m[1]!),
        ];

        for (const veld of velden) {
          if (isEenRegel(veld)) continue;
          gaten.push({
            bestand: path.relative(WORTEL, pad),
            regel: bron.slice(0, treffer.index).split("\n").length,
            veld,
          });
        }
      }
    }
  }

  return gaten;
}

describe("wat je typt, toont de pagina", () => {
  it("leest genoeg bestanden om iets te toetsen", () => {
    // Zonder deze regel zou een mislukt zoekpad de test stilzwijgend laten
    // slagen: nul bestanden betekent ook nul gaten.
    expect([...bronbestanden(WORTEL)].length).toBeGreaterThan(40);
  });

  it("toont elk veld met ruimte voor alinea's ook met zijn regelovergangen", () => {
    const gaten = zoekGaten();
    const omschrijving = gaten.map(
      (gat) => `${gat.bestand}:${gat.regel} toont "${gat.veld}" op één regel`,
    );

    expect(omschrijving).toEqual([]);
  });
});
