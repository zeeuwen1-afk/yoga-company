import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  betaalModus,
  betalenIngericht,
  naarCenten,
  naarMollieBedrag,
} from "./mollie";

const oorspronkelijk = { ...process.env };

beforeEach(() => {
  delete process.env.MOLLIE_API_KEY;
  delete process.env.PAYMENTS_ENABLED;
});

afterEach(() => {
  process.env = { ...oorspronkelijk };
});

describe("bedragen", () => {
  it("zet centen om naar het formaat van Mollie", () => {
    expect(naarMollieBedrag(279500)).toBe("2795.00");
    expect(naarMollieBedrag(79500)).toBe("795.00");
    expect(naarMollieBedrag(2795)).toBe("27.95");
    expect(naarMollieBedrag(5)).toBe("0.05");
  });

  it("leest bedragen van Mollie terug zonder afrondingsfout", () => {
    expect(naarCenten("2795.00")).toBe(279500);
    expect(naarCenten("27.95")).toBe(2795);
    // 0.1 + 0.2 blijft ook hier een valkuil; vandaar het afronden.
    expect(naarCenten("0.30")).toBe(30);
  });

  it("blijft heen en weer kloppen", () => {
    for (const centen of [1, 99, 100, 2795, 79500, 279500]) {
      expect(naarCenten(naarMollieBedrag(centen))).toBe(centen);
    }
  });
});

describe("koppelingsstatus", () => {
  it("staat uit zolang er geen sleutel is", () => {
    expect(betalenIngericht()).toBe(false);
    expect(betaalModus()).toBeNull();
  });

  it("gaat aan zodra de sleutel er staat", () => {
    process.env.MOLLIE_API_KEY = "test_abc123";
    expect(betalenIngericht()).toBe(true);
  });

  it("laat zich uitzetten met PAYMENTS_ENABLED=false", () => {
    process.env.MOLLIE_API_KEY = "live_abc123";
    process.env.PAYMENTS_ENABLED = "false";
    expect(betalenIngericht()).toBe(false);
  });

  it("leest de modus af aan het voorvoegsel van de sleutel", () => {
    process.env.MOLLIE_API_KEY = "test_abc";
    expect(betaalModus()).toBe("test");

    process.env.MOLLIE_API_KEY = "live_abc";
    expect(betaalModus()).toBe("live");

    process.env.MOLLIE_API_KEY = "iets_anders";
    expect(betaalModus()).toBe("onbekend");
  });

  it("trekt zich niets aan van spaties rond de sleutel", () => {
    process.env.MOLLIE_API_KEY = "   ";
    expect(betalenIngericht()).toBe(false);
  });
});
