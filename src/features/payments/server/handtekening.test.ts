import { describe, expect, it } from "vitest";
import Stripe from "stripe";

/**
 * De webhook staat open op het internet. Zonder handtekeningcontrole zou
 * iedereen die het adres kent een inschrijving op betaald kunnen zetten
 * (BOUWPROMPT §9).
 *
 * Deze tests gebruiken Stripe's eigen hulpmiddel om een geldige handtekening
 * te maken, en controleren daarna dat elke afwijking wordt geweigerd.
 */

const GEHEIM = "whsec_testgeheim_alleen_voor_deze_test";

// Voor handtekeningcontrole is geen echte API-sleutel nodig.
const stripe = new Stripe("sk_test_niet_in_gebruik", {
  apiVersion: "2026-07-29.dahlia",
});

const payload = JSON.stringify({
  id: "evt_test",
  type: "checkout.session.completed",
  data: { object: { id: "cs_test", payment_status: "paid" } },
});

function tekenen(inhoud: string, geheim = GEHEIM, tijdstip?: number) {
  return stripe.webhooks.generateTestHeaderString({
    payload: inhoud,
    secret: geheim,
    ...(tijdstip ? { timestamp: tijdstip } : {}),
  });
}

describe("Webhook-handtekening", () => {
  it("aanvaardt een correct ondertekende gebeurtenis", () => {
    const gebeurtenis = stripe.webhooks.constructEvent(
      payload,
      tekenen(payload),
      GEHEIM,
    );

    expect(gebeurtenis.type).toBe("checkout.session.completed");
  });

  it("weigert een gebeurtenis zonder handtekening", () => {
    expect(() => stripe.webhooks.constructEvent(payload, "", GEHEIM)).toThrow();
  });

  it("weigert een handtekening die met een ander geheim is gemaakt", () => {
    const vreemd = tekenen(payload, "whsec_iemand_anders");

    expect(() =>
      stripe.webhooks.constructEvent(payload, vreemd, GEHEIM),
    ).toThrow();
  });

  it("weigert een payload die na ondertekening is aangepast", () => {
    const handtekening = tekenen(payload);
    const geknoeid = payload.replace('"cs_test"', '"cs_vervalst"');

    expect(() =>
      stripe.webhooks.constructEvent(geknoeid, handtekening, GEHEIM),
    ).toThrow();
  });

  it("weigert een oude handtekening, zodat hergebruik niet werkt", () => {
    // Twee uur oud; Stripe hanteert standaard een tolerantie van vijf minuten.
    const tweeUurGeleden = Math.floor(Date.now() / 1000) - 7200;
    const oud = tekenen(payload, GEHEIM, tweeUurGeleden);

    expect(() =>
      stripe.webhooks.constructEvent(payload, oud, GEHEIM),
    ).toThrow();
  });
});
