import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { afmeldUrl, leesAfmeldToken, maakAfmeldToken } from "./afmelden";

/**
 * De afmeldlink is de enige plek waar iemand zonder inlog iets in `profiles`
 * verandert. Als de handtekening niet doet wat hij hoort te doen, kan een
 * willekeurige bezoeker andermans toestemming intrekken.
 */

const PROFIEL = "11111111-1111-1111-1111-111111111111";
const ANDER = "22222222-2222-2222-2222-222222222222";

describe("afmeldtoken", () => {
  beforeEach(() => {
    process.env.MAILING_UNSUBSCRIBE_SECRET = "test-geheim-voor-de-unit-tests";
    process.env.NEXT_PUBLIC_SITE_URL = "https://yogacompanie.nl";
  });

  afterEach(() => {
    delete process.env.MAILING_UNSUBSCRIBE_SECRET;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("leest terug wat het heeft ondertekend", () => {
    expect(leesAfmeldToken(maakAfmeldToken(PROFIEL))).toBe(PROFIEL);
  });

  it("weigert een token zonder handtekening", () => {
    expect(leesAfmeldToken(PROFIEL)).toBeNull();
  });

  it("weigert een verminkte handtekening", () => {
    const token = maakAfmeldToken(PROFIEL);
    const verminkt = `${token.slice(0, -1)}${token.at(-1) === "a" ? "b" : "a"}`;
    expect(leesAfmeldToken(verminkt)).toBeNull();
  });

  it("weigert het profiel-id van een ander onder een geldige handtekening", () => {
    // Het aanvalspatroon: een geldige eigen link pakken en er een ander id in
    // zetten. De handtekening hoort daar niet meer bij te kloppen.
    const handtekening = maakAfmeldToken(PROFIEL).split(".").pop();
    expect(leesAfmeldToken(`${ANDER}.${handtekening}`)).toBeNull();
  });

  it("weigert een token dat met een ander geheim is ondertekend", () => {
    const token = maakAfmeldToken(PROFIEL);
    process.env.MAILING_UNSUBSCRIBE_SECRET = "een-heel-ander-geheim";
    expect(leesAfmeldToken(token)).toBeNull();
  });

  it("weigert lege invoer", () => {
    expect(leesAfmeldToken("")).toBeNull();
    expect(leesAfmeldToken(".")).toBeNull();
  });

  it("bouwt een volledige afmeldlink op de eigen site", () => {
    const url = afmeldUrl(PROFIEL);
    expect(url.startsWith("https://yogacompanie.nl/afmelden/")).toBe(true);
    expect(leesAfmeldToken(url.split("/afmelden/")[1])).toBe(PROFIEL);
  });

  it("keurt zonder geheim elk token af in plaats van te struikelen", () => {
    // De afmeldpagina is openbaar; een ontbrekend geheim mag daar geen
    // foutscherm opleveren.
    const token = maakAfmeldToken(PROFIEL);
    delete process.env.MAILING_UNSUBSCRIBE_SECRET;
    expect(leesAfmeldToken(token)).toBeNull();
  });

  it("gooit bij ondertekenen zodra het geheim ontbreekt", () => {
    // Liever hier stuklopen dan een mailing versturen met een link die niets
    // doet: dan zou de ontvanger zich niet kunnen afmelden.
    delete process.env.MAILING_UNSUBSCRIBE_SECRET;
    expect(() => maakAfmeldToken(PROFIEL)).toThrow();
  });
});
