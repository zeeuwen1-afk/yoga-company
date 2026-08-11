import "server-only";

import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

import { enrollmentIdBijPaymentIntent } from "./checkout";

/**
 * Verwerking van Stripe-gebeurtenissen (BOUWPROMPT §9).
 *
 * Idempotentie is hier geen extraatje maar een eis: Stripe levert een
 * gebeurtenis soms meer dan eens af, en bij een storing opnieuw. Elke
 * bewerking hieronder is daarom voorwaardelijk — hij doet alleen iets als de
 * inschrijving nog niet in de doeltoestand staat. Twee keer dezelfde
 * gebeurtenis levert dus hetzelfde resultaat als één keer.
 *
 * De webhook draait buiten een gebruikerssessie om en gebruikt daarom de
 * service-role client (§17.1).
 */

export type WebhookUitkomst = {
  verwerkt: boolean;
  /** Korte omschrijving voor het logboek; bevat nooit persoonsgegevens. */
  toelichting: string;
  /** Inschrijving die van status veranderde, voor de bevestigingsmail. */
  enrollmentId?: string;
};

async function markeerBetaald(
  enrollmentId: string,
  bedragCenten: number | null,
  sessionId: string,
): Promise<WebhookUitkomst> {
  const supabase = createAdminClient();

  // `neq('status', 'betaald')` maakt dit idempotent: een herhaalde gebeurtenis
  // raakt geen enkele rij en overschrijft dus ook geen betaaldatum.
  const { data, error } = await supabase
    .from("enrollments")
    .update({
      status: "betaald",
      paid_at: new Date().toISOString(),
      amount_cents: bedragCenten,
      stripe_checkout_session_id: sessionId,
    })
    .eq("id", enrollmentId)
    .neq("status", "betaald")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Inschrijving bijwerken mislukte: ${error.message}`);
  }

  if (!data) {
    return {
      verwerkt: false,
      toelichting: "inschrijving stond al op betaald",
    };
  }

  return {
    verwerkt: true,
    toelichting: "inschrijving op betaald gezet",
    enrollmentId,
  };
}

async function markeerGeannuleerd(
  enrollmentId: string,
): Promise<WebhookUitkomst> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("enrollments")
    .update({ status: "geannuleerd" })
    .eq("id", enrollmentId)
    .neq("status", "geannuleerd")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Inschrijving annuleren mislukte: ${error.message}`);
  }

  if (!data) {
    return {
      verwerkt: false,
      toelichting: "inschrijving stond al geannuleerd",
    };
  }

  await supabase.from("audit_log").insert({
    actor_id: null,
    action: "terugbetaling_verwerkt",
    entity: "enrollments",
    entity_id: enrollmentId,
    meta: { bron: "stripe_webhook" },
  });

  return {
    verwerkt: true,
    toelichting: "inschrijving geannuleerd na terugbetaling",
    enrollmentId,
  };
}

export async function verwerkGebeurtenis(
  gebeurtenis: Stripe.Event,
): Promise<WebhookUitkomst> {
  switch (gebeurtenis.type) {
    case "checkout.session.completed": {
      const sessie = gebeurtenis.data.object;

      // Alleen doorzetten als er daadwerkelijk betaald is. Bij iDEAL kan de
      // sessie afgerond zijn terwijl de betaling nog loopt.
      if (sessie.payment_status !== "paid") {
        return {
          verwerkt: false,
          toelichting: `betaalstatus is ${sessie.payment_status}, nog niet verwerkt`,
        };
      }

      const enrollmentId =
        sessie.metadata?.enrollment_id ?? sessie.client_reference_id;

      if (!enrollmentId) {
        return {
          verwerkt: false,
          toelichting: "sessie zonder enrollment_id, overgeslagen",
        };
      }

      return markeerBetaald(enrollmentId, sessie.amount_total, sessie.id);
    }

    case "checkout.session.async_payment_succeeded": {
      // iDEAL-betalingen die pas later definitief worden.
      const sessie = gebeurtenis.data.object;
      const enrollmentId =
        sessie.metadata?.enrollment_id ?? sessie.client_reference_id;

      if (!enrollmentId) {
        return {
          verwerkt: false,
          toelichting: "sessie zonder enrollment_id, overgeslagen",
        };
      }

      return markeerBetaald(enrollmentId, sessie.amount_total, sessie.id);
    }

    case "checkout.session.async_payment_failed": {
      const sessie = gebeurtenis.data.object;
      const enrollmentId =
        sessie.metadata?.enrollment_id ?? sessie.client_reference_id;

      if (!enrollmentId) {
        return {
          verwerkt: false,
          toelichting: "sessie zonder enrollment_id, overgeslagen",
        };
      }

      return markeerGeannuleerd(enrollmentId);
    }

    case "charge.refunded": {
      const charge = gebeurtenis.data.object;
      const paymentIntent =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (!paymentIntent) {
        return {
          verwerkt: false,
          toelichting: "terugbetaling zonder payment intent, overgeslagen",
        };
      }

      const enrollmentId = await enrollmentIdBijPaymentIntent(paymentIntent);

      if (!enrollmentId) {
        return {
          verwerkt: false,
          toelichting: "geen inschrijving gevonden bij deze terugbetaling",
        };
      }

      return markeerGeannuleerd(enrollmentId);
    }

    default:
      return {
        verwerkt: false,
        toelichting: `gebeurtenis ${gebeurtenis.type} vraagt geen actie`,
      };
  }
}
