import { describe, expect, it } from "vitest";

import { BLOKKEN } from "./blokken";

/**
 * De fotovelden per sectie.
 *
 * Elke sectie die de pagina draagt kan sinds september 2026 een eigen foto
 * krijgen, met dezelfde vijf plaatsingen als elders — inclusief de foto áchter
 * de tekst. Dat werkt alleen als drie dingen kloppen, en alle drie zijn stil
 * kapot te maken:
 *
 *  - het blok moet een beeldblok zijn, anders krijgt de beheerder een
 *    tekstveld waar hij een foto verwacht;
 *  - het moet weg te halen zijn, want een pagina hoort niet te verplichten dat
 *    er een foto staat;
 *  - er moet een sectie zijn om bij te horen. Een `foo_beeld` zonder verdere
 *    `foo`-blokken is een fotoveld dat in de editor onder een kopje zonder
 *    inhoud hangt.
 */
describe("de fotovelden per sectie", () => {
  const fotos = BLOKKEN.filter((blok) => blok.block_key.endsWith("_beeld"));

  it("zijn er, zodat de controles hieronder ergens over gaan", () => {
    expect(fotos.length).toBeGreaterThan(30);
  });

  it.each(fotos.map((blok) => [`${blok.page_key}/${blok.block_key}`, blok]))(
    "%s is een beeldblok dat weggehaald mag worden",
    (_naam, blok) => {
      expect(blok.kind).toBe("image");
      expect(blok.verbergbaar).toBe(true);
      expect(blok.value).toEqual({ url: "", alt: "" });
    },
  );

  it.each(fotos.map((blok) => [`${blok.page_key}/${blok.block_key}`, blok]))(
    "%s hoort bij een sectie die ook echt inhoud heeft",
    (_naam, blok) => {
      const voorvoegsel = blok.block_key.slice(0, -"_beeld".length);
      const buren = BLOKKEN.filter(
        (ander) =>
          ander.page_key === blok.page_key &&
          ander.block_key !== blok.block_key &&
          (ander.block_key === voorvoegsel ||
            ander.block_key.startsWith(`${voorvoegsel}_`)),
      );

      // "opening" is de uitzondering: de blokken van de kop delen geen
      // voorvoegsel — het zijn titel, inleiding, label — maar ze vormen in de
      // editor wel één sectie.
      if (voorvoegsel === "opening") {
        expect(
          BLOKKEN.some(
            (ander) =>
              ander.page_key === blok.page_key &&
              ["titel", "naam", "label"].includes(ander.block_key),
          ),
        ).toBe(true);
        return;
      }

      expect(buren.length).toBeGreaterThan(0);
    },
  );
});
