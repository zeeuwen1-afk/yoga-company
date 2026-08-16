import { describe, expect, it } from "vitest";

import { pseudonimiseer, schoonTekst } from "./analyse";

/**
 * Wat hier wordt vastgelegd is een belofte aan de klant: naam, e-mailadres,
 * telefoonnummer en woonplaats verlaten onze server niet. Faalt een van deze
 * tests, dan lekt er iets naar Anthropic dat daar niet hoort.
 */

const dossier = {
  profiel: {
    id: "abc",
    voornaam: "Marieke",
    achternaam: "Jansen",
    email: "marieke.jansen@voorbeeld.nl",
    telefoon: "0612345678",
    woonplaats: "Zwolle",
    geboortedatum: "1980-05-04",
    hoeGevonden: "Via een vriendin",
    ervaring: "Twee jaar Hatha",
    doelen: "Marieke wil rustiger worden na een druk jaar.",
    interesses: ["yin", "ademwerk"],
    rol: "klant" as const,
    actief: true,
    gedeactiveerdOp: null,
    toestemmingOp: "2026-01-01T00:00:00Z",
    aangemaaktOp: "2025-09-01T00:00:00Z",
  },
  inschrijvingen: [
    {
      id: "e1",
      status: "betaald" as const,
      bedragCenten: 79500,
      betaaldOp: "2026-02-03T10:00:00Z",
      aangemaaktOp: "2026-02-01T10:00:00Z",
      cursusId: "c1",
      cursusTitel: "Yin Yoga niveau 1",
      cursusSlug: "yin-niveau-1-basis",
    },
  ],
  notities: [
    {
      id: "n1",
      soort: "verslag" as const,
      titel: "Intake",
      tekst:
        "Jansen kwam binnen met spanning in de schouders. Marieke oefent thuis.",
      geschrevenOp: "2026-02-05T10:00:00Z",
      auteur: "Pieter Beheerder",
    },
  ],
  aanvragen: [],
  gesprek: null,
  boekingen: [
    {
      id: "b1",
      status: "geboekt" as const,
      geboektOp: "2026-08-01T10:00:00Z",
      lesId: "l1",
      lesTitel: "Yin Yoga — maandagavond",
      begintOp: "2026-08-17T17:00:00Z",
      locatie: "Studio",
    },
  ],
  voortgang: {
    aantalItems: 8,
    aantalAfgerond: 3,
    laatstActiefOp: "2026-08-10T09:00:00Z",
  },
};

describe("wat de AI te zien krijgt", () => {
  const uit = pseudonimiseer({
    dossier,
    gezondheid: "Marieke heeft lage rugklachten sinds 2024.",
  });
  const alsTekst = JSON.stringify(uit);

  it("stuurt geen naam mee", () => {
    expect(alsTekst).not.toContain("Marieke");
    expect(alsTekst).not.toContain("Jansen");
  });

  it("stuurt geen e-mailadres of telefoonnummer mee", () => {
    expect(alsTekst).not.toContain("marieke.jansen@voorbeeld.nl");
    expect(alsTekst).not.toContain("0612345678");
  });

  it("stuurt geen woonplaats mee", () => {
    expect(alsTekst).not.toContain("Zwolle");
  });

  it("stuurt geen geboortedatum mee, wel de leeftijd", () => {
    expect(alsTekst).not.toContain("1980-05-04");
    expect(typeof uit.leeftijd).toBe("number");
    expect(uit.leeftijd).toBeGreaterThan(40);
  });

  it("haalt de naam ook uit de vrije tekst", () => {
    expect(uit.notitiesEnVerslagen[0].tekst).toContain("[de klant]");
    expect(uit.notitiesEnVerslagen[0].tekst).not.toContain("Marieke");
    expect(uit.notitiesEnVerslagen[0].tekst).not.toContain("Jansen");
    expect(uit.doelen).not.toContain("Marieke");
    expect(uit.gezondheid).not.toContain("Marieke");
  });

  it("stuurt de inhoud wél mee, anders valt er niets te analyseren", () => {
    expect(uit.gezondheid).toContain("rugklachten");
    expect(uit.inschrijvingen[0].opleiding).toBe("Yin Yoga niveau 1");
    expect(uit.boekingen[0].les).toContain("maandagavond");
    expect(uit.voortgang.onderdelenAfgerond).toBe(3);
    expect(uit.interesses).toEqual(["yin", "ademwerk"]);
  });

  it("laat gezondheid weg als die er niet is", () => {
    const zonder = pseudonimiseer({ dossier, gezondheid: null });
    expect(zonder.gezondheid).toBeNull();
  });
});

describe("het schoonmaken van vrije tekst", () => {
  it("werkt hoofdletterongevoelig en op hele woorden", () => {
    expect(schoonTekst("marieke en MARIEKE", ["Marieke"])).toBe(
      "[de klant] en [de klant]",
    );
  });

  it("raakt woorden waar de naam toevallig in zit niet aan", () => {
    // "Mar" zit in "maart", maar is te kort om op te ruimen.
    expect(schoonTekst("in maart begonnen", ["Mar"])).toBe("in maart begonnen");
  });

  it("laat de rest van de zin met rust", () => {
    expect(schoonTekst("Jansen oefent thuis.", ["Jansen"])).toBe(
      "[de klant] oefent thuis.",
    );
  });
});
