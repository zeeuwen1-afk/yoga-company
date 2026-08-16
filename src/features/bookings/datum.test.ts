import { describe, expect, it } from "vitest";

import {
  dagSleutel,
  formateerTijd,
  formateerTijdvak,
  groepeerPerDag,
} from "./datum";

describe("roosterdatums", () => {
  it("toont tijden in de Nederlandse zone, niet in UTC", () => {
    // 17:00 UTC is 19:00 in Amsterdam tijdens de zomertijd.
    expect(formateerTijd("2026-08-18T17:00:00Z")).toBe("19:00");
    // En 18:00 in de wintertijd.
    expect(formateerTijd("2026-12-15T17:00:00Z")).toBe("18:00");
  });

  it("rekent het eindtijdstip uit de duur", () => {
    expect(formateerTijdvak("2026-08-18T17:00:00Z", 75)).toBe("19:00 – 20:15");
  });

  it("groepeert op de kalenderdag in Amsterdam", () => {
    // 22:30 UTC is de volgende dag 00:30 in Amsterdam. Zou de groepering op
    // UTC gaan, dan viel deze les op de verkeerde dag.
    expect(dagSleutel("2026-08-18T22:30:00Z")).toBe("2026-08-19");
  });

  it("houdt lessen van dezelfde dag bij elkaar en bewaart de volgorde", () => {
    const dagen = groepeerPerDag([
      { begintOp: "2026-08-18T07:00:00Z", titel: "ochtend" },
      { begintOp: "2026-08-18T17:00:00Z", titel: "avond" },
      { begintOp: "2026-08-20T17:00:00Z", titel: "donderdag" },
    ]);

    expect(dagen).toHaveLength(2);
    expect(dagen[0].lessen.map((les) => les.titel)).toEqual([
      "ochtend",
      "avond",
    ]);
    expect(dagen[0].label).toBe("dinsdag 18 augustus");
    expect(dagen[1].lessen).toHaveLength(1);
  });

  it("geeft een leeg rooster netjes terug", () => {
    expect(groepeerPerDag([])).toEqual([]);
  });
});
