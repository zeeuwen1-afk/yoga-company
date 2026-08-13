import "server-only";

import Stripe from "stripe";

/**
 * Stripe-client, uitsluitend server-side (BOUWPROMPT §9).
 *
 * Er komen nooit kaart- of rekeninggegevens bij ons binnen: de betaling loopt
 * volledig via Stripe Checkout. Wij bewaren alleen de sessie-id, het bedrag en
 * de status (§2.5).
 */

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY ontbreekt. Zet hem in .env.local (zie .env.example).",
    );
  }

  client ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    // Vastgezet zodat een nieuwe Stripe-versie de betaalflow niet stilletjes
    // verandert. Bewust bijwerken, niet automatisch meebewegen. Deze versie
    // hoort bij stripe@22; controleer hem bij een SDK-upgrade.
    apiVersion: "2026-07-29.dahlia",
    appInfo: { name: "YogaCompany", version: "1.0.0" },
  });

  return client;
}

/** Is de betaalkoppeling ingericht? Zo niet, dan tonen we dat netjes. */
export function stripeIngericht(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
