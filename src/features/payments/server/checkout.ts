import "server-only";

import type Stripe from "stripe";

import { publicEnv } from "@/lib/env";
import { stripe } from "@/lib/stripe";

/**
 * Aanmaken van een Stripe Checkout-sessie (BOUWPROMPT §9).
 *
 * De inschrijving bestaat op dit moment al in onze database met status
 * `in_afwachting`. Het `enrollment_id` in de metadata is de enige schakel
 * tussen Stripe en ons; daarop verwerkt de webhook straks de betaling.
 */

export type CheckoutInvoer = {
  enrollmentId: string;
  cursusTitel: string;
  cursusSlug: string;
  prijsCenten: number;
  valuta: string;
  emailKlant: string;
  /** Bestaande Stripe-prijs, wanneer die in het dashboard is aangemaakt. */
  stripePriceId?: string | null;
};

export async function maakCheckoutSessie(
  invoer: CheckoutInvoer,
): Promise<{ url: string; sessionId: string }> {
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem =
    invoer.stripePriceId
      ? { price: invoer.stripePriceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: invoer.valuta,
            unit_amount: invoer.prijsCenten,
            product_data: { name: invoer.cursusTitel },
          },
        };

  const sessie = await stripe().checkout.sessions.create(
    {
      mode: "payment",
      // iDEAL en kaart, de twee methoden uit §9.
      payment_method_types: ["ideal", "card"],
      line_items: [lineItem],
      customer_email: invoer.emailKlant,
      locale: "nl",
      client_reference_id: invoer.enrollmentId,
      metadata: { enrollment_id: invoer.enrollmentId },
      // Ook op de betaling zelf, zodat een terugbetaling terug te leiden is
      // naar de inschrijving zonder extra opslag aan onze kant.
      payment_intent_data: {
        metadata: { enrollment_id: invoer.enrollmentId },
      },
      success_url: `${basis}/inschrijven/gelukt?sessie={CHECKOUT_SESSION_ID}`,
      cancel_url: `${basis}/inschrijven/${invoer.cursusSlug}?geannuleerd=1`,
    },
    {
      // Twee keer klikken mag nooit twee sessies opleveren.
      idempotencyKey: `enrollment-${invoer.enrollmentId}`,
    },
  );

  if (!sessie.url) {
    throw new Error("Stripe leverde geen betaallink op");
  }

  return { url: sessie.url, sessionId: sessie.id };
}

/**
 * Zoekt de inschrijving bij een terugbetaling. De koppeling loopt via de
 * metadata op de payment intent, zodat we geen extra kolom hoeven te bewaren
 * (BOUWPROMPT §2.5).
 */
export async function enrollmentIdBijPaymentIntent(
  paymentIntentId: string,
): Promise<string | null> {
  const intent = await stripe().paymentIntents.retrieve(paymentIntentId);
  return intent.metadata?.enrollment_id ?? null;
}
