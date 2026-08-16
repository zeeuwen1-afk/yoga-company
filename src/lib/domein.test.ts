import { describe, expect, it } from "vitest";

import { isProductiedomein } from "./domein";

describe("isProductiedomein", () => {
  it("herkent het eigen domein, met en zonder www", () => {
    expect(isProductiedomein("https://yogacompany.eu")).toBe(true);
    expect(isProductiedomein("https://www.yogacompany.eu")).toBe(true);
    expect(isProductiedomein("https://yogacompany.eu/")).toBe(true);
    // Hoofdletters in een adres zijn geldig; de hostnaam is niet hoofdlettergevoelig.
    expect(isProductiedomein("https://YogaCompany.EU")).toBe(true);
  });

  it("herkent een proefadres niet als het echte domein", () => {
    expect(isProductiedomein("https://yoga-company.vercel.app")).toBe(false);
    expect(
      isProductiedomein("https://yoga-company-5qkp7j3cv-polar-fox1.vercel.app"),
    ).toBe(false);
    expect(isProductiedomein("http://localhost:3000")).toBe(false);
  });

  /**
   * De valkuil waar deze controle voor bedoeld is: een domein dat het echte
   * domein als staart heeft. `yogacompany.eu.kwaadwillend.nl` eindigt op onze
   * naam, maar is van iemand anders. Een controle met `endsWith` zou hem
   * doorlaten.
   */
  it("trapt niet in een domein dat er alleen op eindigt", () => {
    expect(isProductiedomein("https://yogacompany.eu.voorbeeld.nl")).toBe(
      false,
    );
    expect(isProductiedomein("https://nietyogacompany.eu")).toBe(false);
  });

  it("gaat bij twijfel uit van geen productiedomein", () => {
    expect(isProductiedomein(undefined)).toBe(false);
    expect(isProductiedomein("")).toBe(false);
    expect(isProductiedomein("yogacompany.eu")).toBe(false); // zonder schema
  });
});
