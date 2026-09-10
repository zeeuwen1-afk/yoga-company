import { describe, expect, it } from "vitest";

import { AANBOD } from "./aanbod";
import { leesNiveau, NIVEAU_INFO, NIVEAUS } from "./niveaus";

describe("leesNiveau", () => {
  it("kent de drie niveaus, ongeacht hoofdletters en spaties", () => {
    expect(leesNiveau("foundation")).toBe("foundation");
    expect(leesNiveau(" Advanced ")).toBe("advanced");
    expect(leesNiveau("PROFESSIONAL")).toBe("professional");
  });

  it("maakt van alles wat geen niveau is null, want dat is geen badge", () => {
    expect(leesNiveau("")).toBeNull();
    expect(leesNiveau(null)).toBeNull();
    expect(leesNiveau(undefined)).toBeNull();
    expect(leesNiveau("master")).toBeNull();
    expect(leesNiveau(50)).toBeNull();
  });
});

describe("de niveaus", () => {
  it("lopen op in uren: 50, 100, 200", () => {
    expect(NIVEAUS.map((niveau) => NIVEAU_INFO[niveau].uren)).toEqual([
      50, 100, 200,
    ]);
  });

  it("leveren een certificaat op, en alleen Professional een diploma", () => {
    expect(NIVEAU_INFO.foundation.onderregel).toBe("Certificaat");
    expect(NIVEAU_INFO.advanced.onderregel).toBe("Certificaat");
    expect(NIVEAU_INFO.professional.onderregel).toBe("Diploma");
  });
});

describe("het aanbod", () => {
  // Een opleiding zonder niveau zou op de site staan zonder badge, terwijl elke
  // opleiding er een hoort te dragen. Een training met een niveau zou een
  // certificaat beloven dat er niet is.
  it("geeft elke opleiding een niveau en een training geen", () => {
    for (const cursus of AANBOD) {
      if (cursus.type === "opleiding") {
        expect(cursus.certificaatNiveau, cursus.slug).toBeDefined();
      } else {
        expect(cursus.certificaatNiveau, cursus.slug).toBeUndefined();
      }
    }
  });
});
