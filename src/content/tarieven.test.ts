import { describe, expect, it } from "vitest";

import { aangezet, alsBedrag, PRODUCTEN, TARIEVEN } from "./tarieven";

describe("aangezet", () => {
  it("herkent ja, ongeacht hoofdletters of spaties", () => {
    expect(aangezet("ja")).toBe(true);
    expect(aangezet("Ja")).toBe(true);
    expect(aangezet(" JA ")).toBe(true);
  });

  it("beschouwt al het overige als uit", () => {
    expect(aangezet("")).toBe(false);
    expect(aangezet("nee")).toBe(false);
    expect(aangezet("x")).toBe(false);
    expect(aangezet(undefined)).toBe(false);
  });
});

describe("de startlijst met tarieven", () => {
  it("licht precies één kaart uit", () => {
    const uitgelicht = TARIEVEN.filter((t) => aangezet(t.uitgelicht));
    expect(uitgelicht).toHaveLength(1);
    expect(uitgelicht[0]!.naam).toBe("10-strippenkaart");
  });

  /**
   * Meer dan vier regels past niet naast het weekrooster zonder dat het
   * balkje langer wordt dan het rooster zelf. Deze test is de rem daarop.
   */
  it("zet hooguit vier regels in het zijbalkje", () => {
    const opRail = TARIEVEN.filter((t) => aangezet(t.rail));
    expect(opRail.length).toBeGreaterThan(0);
    expect(opRail.length).toBeLessThanOrEqual(4);
  });

  it("geeft elke kaart een naam, een prijs en een prijs per les", () => {
    for (const tarief of TARIEVEN) {
      expect(tarief.naam.length).toBeGreaterThan(0);
      expect(tarief.prijs).toMatch(/^€/);
      expect(tarief.per_les).toMatch(/€/);
    }
  });
});

/**
 * De tarievenpagina toont bedragen als tekst; de database rekent met centen.
 * Twee lijsten die hetzelfde horen te zeggen lopen na de eerste prijswijziging
 * uit elkaar — tenzij iets ze naast elkaar legt. Dat is deze test.
 */
describe("de prijslijst en de producten horen bij elkaar", () => {
  it("kent dezelfde namen in dezelfde volgorde", () => {
    expect(PRODUCTEN.map((p) => p.naam)).toEqual(TARIEVEN.map((t) => t.naam));
  });

  it("toont exact het bedrag waarmee de database rekent", () => {
    for (const [index, product] of PRODUCTEN.entries()) {
      expect(TARIEVEN[index]!.prijs).toBe(alsBedrag(product.prijs_centen));
    }
  });

  /**
   * De verrekenwaarde is het bedrag exclusief btw. Bij de vier producten met
   * een vast aantal lessen moet dat overeenkomen met de prijs per les die op
   * de pagina staat, gedeeld door 1,09. Wijkt het af, dan betaalt de uitgever
   * bij kruisgebruik meer terug dan hij van de klant overhield.
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
});
