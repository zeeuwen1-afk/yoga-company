import { describe, expect, it } from "vitest";

import { aangezet, TARIEVEN } from "./tarieven";

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
