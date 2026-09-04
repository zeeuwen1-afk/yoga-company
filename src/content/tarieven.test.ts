import { describe, expect, it } from "vitest";

import {
  alsBedrag,
  PRIVE,
  PRODUCTEN,
  WORKSHOPS,
  type Aanbod,
} from "./tarieven";

/**
 * Er stond hier een test die bewaakte dat de prijzen op de tarievenpagina exact
 * gelijk waren aan de bedragen waarmee het strippenkaartsysteem rekent. Dat was
 * juist zolang die twee hetzelfde waren.
 *
 * Sinds de pagina iets anders toont dan de software verkoopt — lessen bij een
 * yogaschool, workshops en privéyoga, in plaats van kaarten — bestaat die
 * koppeling niet meer, en zou zo'n test alleen nog omvallen zonder dat er iets
 * mis is.
 *
 * Wat overblijft is de controle die er echt toe doet: dat het geld in het
 * kaartsysteem klopt. Die producten worden nergens meer aangeboden, maar het
 * systeem staat er nog en moet blijven werken zodra het weer wordt aangezet.
 */

describe("wat op de tarievenpagina staat", () => {
  const alleRegels: Aanbod[] = [...WORKSHOPS, ...PRIVE];

  it("geeft elk aanbod een naam, een duur en een bedrag", () => {
    for (const regel of alleRegels) {
      expect(regel.naam.length).toBeGreaterThan(0);
      expect(regel.duur.length).toBeGreaterThan(0);
      expect(regel.prijs).toMatch(/€/);
    }
  });

  it("houdt privéyoga op maximaal twee personen", () => {
    // Meer dan twee is geen privéles meer maar een kleine groep, en dan kun je
    // niet meer meekijken en corrigeren. Staat er ooit een duo-plus-één in de
    // startinhoud, dan is dat een besluit en geen slordigheid.
    const meerDanTwee = PRIVE.filter((regel) =>
      /\b([3-9]|1\d)\s*personen\b/i.test(`${regel.naam} ${regel.toelichting}`),
    );
    expect(meerDanTwee).toEqual([]);
  });

  it("maakt de duo-les voordeliger per persoon dan de losse privéles", () => {
    // Anders is er geen enkele reden om met z'n tweeën te komen, en verkoopt
    // het tarief zichzelf niet.
    const alleen = PRIVE.find((r) => r.naam === "Privéles, 1 persoon");
    const duo = PRIVE.find((r) => r.naam === "Duo, 2 personen");
    expect(alleen).toBeDefined();
    expect(duo).toBeDefined();

    const bedrag = (tekst: string) =>
      Number(tekst.replace(/[^\d,]/g, "").replace(",", "."));
    expect(bedrag(duo!.prijs) / 2).toBeLessThan(bedrag(alleen!.prijs));
  });
});

describe("het strippenkaartsysteem", () => {
  /**
   * De verrekenwaarde is het bedrag exclusief btw. Bij de vier producten met
   * een vast aantal lessen moet dat overeenkomen met de prijs per les gedeeld
   * door 1,09. Wijkt het af, dan betaalt de uitgever bij kruisgebruik meer
   * terug dan hij van de klant overhield.
   */
  it("verrekent op de nettoprijs per les, niet op het brutobedrag", () => {
    const metStrippen = PRODUCTEN.filter(
      (p) => p.aantal_lessen !== null && p.verrekenwaarde_centen !== null,
    );
    expect(metStrippen.length).toBe(4);

    for (const product of metStrippen) {
      const netto = product.prijs_centen / 1.09 / product.aantal_lessen!;
      // Eén cent speling: de bedragen zijn afgerond vastgelegd.
      expect(Math.abs(product.verrekenwaarde_centen! - netto)).toBeLessThan(1);
    }
  });

  it("geeft een kaart nooit meer terug dan hij heeft opgebracht", () => {
    // De kern van het kruisgebruik: wie de kaart verkocht, houdt de btw en het
    // verschil. Draait dit om, dan kost elke les bij een collega geld.
    for (const product of PRODUCTEN) {
      if (product.verrekenwaarde_centen === null) continue;
      const perLes =
        product.aantal_lessen === null
          ? product.prijs_centen
          : product.prijs_centen / product.aantal_lessen;
      expect(product.verrekenwaarde_centen).toBeLessThan(perLes);
    }
  });

  it("laat de snuffelkaart buiten het kruisgebruik", () => {
    const snuffel = PRODUCTEN.find((p) => p.naam === "Snuffelkaart")!;
    expect(snuffel.kruisgebruik_toegestaan).toBe(false);
    expect(snuffel.verrekenwaarde_centen).toBeNull();
  });

  it("geeft elk product dat kruisgebruik toestaat een verrekenwaarde", () => {
    for (const product of PRODUCTEN) {
      if (product.kruisgebruik_toegestaan) {
        expect(product.verrekenwaarde_centen).toBeGreaterThan(0);
      }
    }
  });

  it("zet een plafond op de abonnementen en niet op de strippenkaarten", () => {
    for (const product of PRODUCTEN) {
      if (product.aantal_lessen === null) {
        expect(product.max_kruislessen_per_maand).toBe(2);
      } else {
        expect(product.max_kruislessen_per_maand).toBeNull();
      }
    }
  });

  it("houdt elk product uniek in de database", () => {
    const ids = PRODUCTEN.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("alsBedrag", () => {
  it("schrijft centen als een Nederlands bedrag", () => {
    expect(alsBedrag(1700)).toBe("€ 17,00");
    expect(alsBedrag(900)).toBe("€ 9,00");
    expect(alsBedrag(0)).toBe("€ 0,00");
  });
});
