import { describe, expect, it } from "vitest";

import { AANBOD } from "./aanbod";
import { cursusPad, leesSoort, SOORT_INFO, SOORTEN } from "./soorten";

describe("de soorten aanbod", () => {
  it("kent opleiding, training en workshop", () => {
    expect(SOORTEN).toEqual(["opleiding", "training", "workshop"]);
  });

  it("houdt de lijst en de tabel gelijk", () => {
    // De lijst staat er met de hand in, omdat het invoerschema van het
    // beheerformulier hem nodig heeft voordat de code draait. Loopt hij uit de
    // pas met de tabel, dan mist een soort zijn adres of staat er een soort in
    // het keuzemenu die nergens heen gaat.
    expect([...SOORTEN].sort()).toEqual(Object.keys(SOORT_INFO).sort());
  });

  it("geeft elke soort een eigen adres", () => {
    const paden = SOORTEN.map((soort) => SOORT_INFO[soort].pad);
    expect(new Set(paden).size).toBe(paden.length);
    for (const pad of paden) expect(pad).toMatch(/^\/[a-z]+$/);
  });

  it("geeft elke soort een eigen kruimelveld", () => {
    const velden = SOORTEN.map((soort) => SOORT_INFO[soort].kruimelBlok);
    expect(new Set(velden).size).toBe(velden.length);
  });

  it("bouwt het adres van één cursus", () => {
    expect(cursusPad("workshop", "the-art-of-slowing-down")).toBe(
      "/workshops/the-art-of-slowing-down",
    );
    expect(cursusPad("opleiding", "yin-niveau-1-basis")).toBe(
      "/opleidingen/yin-niveau-1-basis",
    );
  });
});

describe("leesSoort", () => {
  it("kent de drie soorten, ongeacht hoofdletters en spaties", () => {
    expect(leesSoort("workshop")).toBe("workshop");
    expect(leesSoort(" Training ")).toBe("training");
  });

  it("maakt van alles wat geen soort is null", () => {
    // Een onbekende waarde in de database mag geen kapotte pagina opleveren.
    for (const waarde of ["", "cursus", null, undefined, 3])
      expect(leesSoort(waarde)).toBeNull();
  });
});

describe("het aanbod", () => {
  it("heeft voor elke cursus een bekende soort met een adres", () => {
    for (const cursus of AANBOD) {
      expect(SOORT_INFO[cursus.type], cursus.slug).toBeDefined();
    }
  });
});
