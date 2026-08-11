import { describe, expect, it } from "vitest";

import { formateerPrijs } from "./prijs";

/**
 * Bedragen staan in centen in de database en worden pas bij het tonen omgezet,
 * zodat er nooit met kommagetallen gerekend wordt (BOUWPROMPT §6).
 */
describe("formateerPrijs", () => {
  it("toont hele bedragen zonder centen", () => {
    // Non-breaking space na het euroteken; die zet Intl er zelf in.
    expect(formateerPrijs(299500).replace(/ /g, " ")).toBe("€ 2.995");
    expect(formateerPrijs(84500).replace(/ /g, " ")).toBe("€ 845");
    expect(formateerPrijs(29500).replace(/ /g, " ")).toBe("€ 295");
  });

  it("toont centen wanneer die er zijn", () => {
    expect(formateerPrijs(129950).replace(/ /g, " ")).toBe("€ 1.299,50");
  });

  it("gebruikt het Nederlandse duizendtalteken", () => {
    expect(formateerPrijs(1000000)).toContain("10.000");
  });

  it("kan met nul overweg", () => {
    expect(formateerPrijs(0).replace(/ /g, " ")).toBe("€ 0");
  });

  it("volgt de meegegeven valuta", () => {
    expect(formateerPrijs(29500, "usd")).toContain("US$");
  });
});
