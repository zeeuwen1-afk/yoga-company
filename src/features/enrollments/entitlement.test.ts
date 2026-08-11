import { describe, expect, it } from "vitest";

import { geeftToegang } from "./entitlement";

/**
 * Toegang tot digitale content volgt uit de betaalstatus (BOUWPROMPT §12).
 * Deze regel staat ook in de database, in `has_course_access()`; die is de
 * beslissende. Beide moeten hetzelfde zeggen — vandaar deze test naast de
 * RLS-tests.
 */
describe("geeftToegang", () => {
  it("geeft toegang na betaling", () => {
    expect(geeftToegang("betaald")).toBe(true);
  });

  it("houdt toegang na afronding", () => {
    expect(geeftToegang("afgerond")).toBe(true);
  });

  it("geeft geen toegang zolang de betaling in afwachting is", () => {
    expect(geeftToegang("in_afwachting")).toBe(false);
  });

  it("neemt toegang weg na annulering of terugbetaling", () => {
    expect(geeftToegang("geannuleerd")).toBe(false);
  });
});
