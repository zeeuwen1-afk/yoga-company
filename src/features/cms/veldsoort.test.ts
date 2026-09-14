import { describe, expect, it } from "vitest";

import { BLOKKEN } from "@/content/blokken";

import { isEenRegel, meerdereRegels } from "./veldsoort";

describe("velden die één regel zijn", () => {
  it.each([
    "titel",
    "hero_titel",
    "cta_knop",
    "cta_link",
    "banner_kleur",
    "praktisch_certificaat_naam",
    "kop_kruimel_opleiding",
    "certificering_kolom_yaf",
    "opleidingen_beeld",
    // Een uitzondering op de naam: staat achter een bedrag op één regel.
    "aanbod_per_module",
  ])("%s krijgt één regel", (sleutel) => {
    expect(isEenRegel(sleutel)).toBe(true);
  });
});

describe("velden waarin je alinea's moet kunnen maken", () => {
  it.each([
    // Het veld waarin een workshop van een hele dag werd beschreven. Dit
    // stond niet in de oude lijst, en daardoor kon er geen witregel in.
    "toelichting",
    "tekst",
    "inleiding",
    "hero_kenmerken",
    "prijs_voet",
    "over",
    "bio",
    "citaat",
    "niveaus_foundation",
    "concept_waarschuwing",
    // Een naam die nog niet bestaat hoort ook ruimte te krijgen: de regel
    // faalt open, niet dicht.
    "iets_wat_niemand_heeft_bedacht",
  ])("%s krijgt een tekstvak", (sleutel) => {
    expect(meerdereRegels(sleutel)).toBe(true);
  });
});

describe("de velden die er echt zijn", () => {
  /**
   * De blokken waarin de startinhoud al een witregel heeft, moeten met zekerheid
   * een tekstvak krijgen. Zou er één tussen zitten die één regel krijgt, dan
   * kon de beheerder zijn eigen alinea's niet meer terugzetten na een wijziging.
   */
  it("geeft elk blok met een witregel in de startinhoud een tekstvak", () => {
    const metWitregel = BLOKKEN.filter(
      (blok) =>
        blok.kind === "text" &&
        "text" in blok.value &&
        blok.value.text.includes("\n"),
    );

    for (const blok of metWitregel) {
      expect(meerdereRegels(blok.block_key), blok.block_key).toBe(true);
    }
  });

  it("laat de korte velden kort", () => {
    // Een steekproef uit wat er echt staat: als deze een tekstvak zouden
    // krijgen, wordt het bewerkscherm een muur van lege vakken.
    const kort = BLOKKEN.filter(
      (blok) =>
        blok.kind === "text" &&
        "text" in blok.value &&
        blok.value.text.length > 0 &&
        blok.value.text.length < 25 &&
        !blok.value.text.includes("\n"),
    );

    expect(kort.length).toBeGreaterThan(30);
    const metVak = kort.filter((blok) => meerdereRegels(blok.block_key));
    // Ruim de helft hoort één regel te blijven; een paar uitzonderingen mogen.
    expect(metVak.length).toBeLessThan(kort.length / 2);
  });
});
