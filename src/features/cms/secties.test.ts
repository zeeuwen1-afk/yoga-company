import { describe, expect, it } from "vitest";

import { groepeerInSecties } from "./secties";

/**
 * De indeling van het bewerkscherm volgt uit de namen van de blokken. Dat is
 * goedkoop en blijft vanzelf kloppen, maar alleen zolang de regel doet wat je
 * verwacht bij de vormen die er echt zijn. Vandaar deze vier.
 */

const blok = (blockKey: string) => ({ blockKey });

describe("groepeerInSecties", () => {
  it("zet blokken met hetzelfde voorvoegsel bij elkaar", () => {
    const secties = groepeerInSecties(
      [
        "hero_titel",
        "hero_subtitel",
        "hero_knop",
        "cta_titel",
        "cta_tekst",
      ].map(blok),
    );

    expect(secties).toHaveLength(2);
    expect(secties[0]!.naam).toBe("Hero, het eerste scherm");
    expect(secties[0]!.blokken).toHaveLength(3);
    expect(secties[1]!.naam).toBe("Oproep onderaan");
  });

  it("maakt van de kop van een pagina één sectie", () => {
    // Zonder deze uitzondering zou bedrijfsyoga beginnen met vijf secties van
    // één blok: label, titel, inleiding, knop, beeld.
    const secties = groepeerInSecties(
      ["label", "titel", "inleiding", "knop", "knop_link", "beeld"].map(blok),
    );

    expect(secties).toHaveLength(1);
    expect(secties[0]!.sleutel).toBe("opening");
    expect(secties[0]!.blokken).toHaveLength(6);
  });

  it("houdt een titel verderop op de pagina buiten de kop", () => {
    // `cta_titel` is geen paginakop, en een tweede losse `titel` na een andere
    // sectie hoort ook niet meer bij de opening.
    const secties = groepeerInSecties(
      ["titel", "verhaal", "cta_titel", "cta_tekst"].map(blok),
    );

    expect(secties.map((s) => s.sleutel)).toEqual([
      "opening",
      "verhaal",
      "cta",
    ]);
  });

  it("laat een blok zonder voorvoegsel zijn eigen sectie zijn", () => {
    const secties = groepeerInSecties(
      ["hero_titel", "testimonials", "organisaties"].map(blok),
    );

    expect(secties.map((s) => s.naam)).toEqual([
      "Hero, het eerste scherm",
      "Ervaringen",
      "Voor organisaties",
    ]);
  });

  it("houdt de volgorde van de pagina aan", () => {
    // De volgorde in de lijst bepaalt ook hoe de pagina wordt opgebouwd; door
    // elkaar husselen zou het scherm laten afwijken van wat je rechts ziet.
    const secties = groepeerInSecties(
      ["banner_tekst", "hero_titel", "banner_kleur"].map(blok),
    );

    expect(secties.map((s) => s.sleutel)).toEqual(["banner", "hero", "banner"]);
  });
});
