import "server-only";

import { haalBetaling, naarCenten, type MollieBetaling } from "@/lib/mollie";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Verwerking van Mollie-webhooks (bouwprompt §7.6).
 *
 * Mollie heeft geen handtekening
 * ------------------------------
 * Waar Stripe de gebeurtenis meestuurt en ondertekent, stuurt Mollie alléén
 * `id=tr_xxx`. Er valt niets te verifiëren, en de inhoud van het verzoek is
 * dus per definitie onbetrouwbaar: iedereen kan die POST nadoen.
 *
 * Daarom halen we de betaling zelf op bij Mollie, met onze geheime sleutel.
 * Wat daar staat is waar; wat in het verzoek staat is hooguit een tip dat er
 * iets is gebeurd. Een verzonnen id levert een 404 bij Mollie op en verder
 * niets. Dit is niet een zwakkere variant van een handtekeningcontrole — het
 * is een sterkere, want de status komt rechtstreeks van de bron.
 *
 * Idempotentie is een eis, geen extraatje: Mollie levert dezelfde webhook
 * meerdere keren af, en bij een storing opnieuw. Elke bewerking hieronder is
 * daarom voorwaardelijk — hij doet alleen iets als de bestelling nog niet in
 * de doeltoestand staat.
 *
 * Draait buiten een gebruikerssessie om en gebruikt de service-role (§8.5).
 */

export type WebhookUitkomst = {
  verwerkt: boolean;
  /** Korte omschrijving voor het logboek; bevat nooit persoonsgegevens. */
  toelichting: string;
  /** Inschrijvingen die zijn geactiveerd, voor de bevestigingsmail. */
  enrollmentIds?: string[];
};

type Bestelling = {
  id: string;
  profile_id: string;
  status: string;
  currency: string;
};

async function zoekBestelling(
  betaling: MollieBetaling,
): Promise<Bestelling | null> {
  const supabase = createAdminClient();

  // Eerst op het betaal-id: dat is de sterkste sleutel en uniek geïndexeerd.
  const { data: opBetaling } = await supabase
    .from("orders")
    .select("id, profile_id, status, currency")
    .eq("mollie_payment_id", betaling.id)
    .maybeSingle();

  if (opBetaling) return opBetaling;

  // Anders via de metadata. Dat pad bestaat voor het zeldzame geval dat het
  // vastleggen van het betaal-id misging nadat de betaling al was aangemaakt.
  const orderId = betaling.metadata?.order_id;
  if (!orderId) return null;

  const { data: opMetadata } = await supabase
    .from("orders")
    .select("id, profile_id, status, currency")
    .eq("id", orderId)
    .maybeSingle();

  return opMetadata ?? null;
}

/**
 * Zet de inschrijvingen klaar voor elke bestelregel die op een opleiding
 * slaat. Een bestaande inschrijving wordt bijgewerkt in plaats van
 * verdubbeld — de unieke sleutel op (profile_id, course_id) zou dat toch
 * weigeren.
 */
async function activeerInschrijvingen(
  bestelling: Bestelling,
): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: regels } = await supabase
    .from("order_items")
    .select("course_id, amount_cents")
    .eq("order_id", bestelling.id)
    .not("course_id", "is", null);

  const ids: string[] = [];

  for (const regel of regels ?? []) {
    if (!regel.course_id) continue;

    const { data, error } = await supabase
      .from("enrollments")
      .upsert(
        {
          profile_id: bestelling.profile_id,
          course_id: regel.course_id,
          status: "betaald",
          paid_at: new Date().toISOString(),
          amount_cents: regel.amount_cents,
          order_id: bestelling.id,
        },
        { onConflict: "profile_id,course_id" },
      )
      .select("id")
      .single();

    if (error) {
      throw new Error(`Inschrijving aanmaken mislukte: ${error.message}`);
    }
    if (data) ids.push(data.id);
  }

  return ids;
}

async function markeerBetaald(
  bestelling: Bestelling,
  betaling: MollieBetaling,
): Promise<WebhookUitkomst> {
  const supabase = createAdminClient();

  // `neq('status', 'paid')` maakt dit idempotent: een herhaalde webhook raakt
  // geen enkele rij en overschrijft dus ook geen betaaldatum.
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      amount_cents: naarCenten(betaling.amount.value),
      mollie_payment_id: betaling.id,
    })
    .eq("id", bestelling.id)
    .neq("status", "paid")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Bestelling bijwerken mislukte: ${error.message}`);
  }

  if (!data) {
    return { verwerkt: false, toelichting: "bestelling stond al op betaald" };
  }

  const enrollmentIds = await activeerInschrijvingen(bestelling);

  return {
    verwerkt: true,
    toelichting: `bestelling op betaald gezet, ${enrollmentIds.length} inschrijving(en) geactiveerd`,
    enrollmentIds,
  };
}

async function markeerMislukt(
  bestelling: Bestelling,
  status: string,
): Promise<WebhookUitkomst> {
  const supabase = createAdminClient();

  // Een bestelling die al betaald is, mag door een late 'expired' nooit meer
  // omvallen. Vandaar de expliciete voorwaarde op de huidige status.
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "canceled" })
    .eq("id", bestelling.id)
    .in("status", ["concept", "open"])
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Bestelling annuleren mislukte: ${error.message}`);
  }

  if (!data) {
    return {
      verwerkt: false,
      toelichting: "bestelling was niet meer te annuleren",
    };
  }

  return {
    verwerkt: true,
    toelichting: `bestelling geannuleerd na status ${status}`,
  };
}

async function markeerTerugbetaald(
  bestelling: Bestelling,
): Promise<WebhookUitkomst> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "refunded", refunded_at: new Date().toISOString() })
    .eq("id", bestelling.id)
    .neq("status", "refunded")
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Terugbetaling verwerken mislukte: ${error.message}`);
  }

  if (!data) {
    return { verwerkt: false, toelichting: "was al als terugbetaald bekend" };
  }

  // De toegang tot het lesmateriaal vervalt met de terugbetaling.
  await supabase
    .from("enrollments")
    .update({ status: "geannuleerd" })
    .eq("order_id", bestelling.id)
    .neq("status", "geannuleerd");

  await supabase.from("audit_log").insert({
    actor_id: null,
    action: "terugbetaling_verwerkt",
    entity: "orders",
    entity_id: bestelling.id,
    meta: { bron: "mollie_webhook" },
  });

  return {
    verwerkt: true,
    toelichting: "bestelling terugbetaald, inschrijvingen ingetrokken",
  };
}

/**
 * Verwerkt één webhookmelding. Krijgt alleen het betaal-id mee: alles wat er
 * daarna gebeurt, volgt uit wat Mollie zelf over die betaling zegt.
 */
export async function verwerkWebhook(
  betalingId: string,
): Promise<WebhookUitkomst> {
  const betaling = await haalBetaling(betalingId);
  const bestelling = await zoekBestelling(betaling);

  if (!bestelling) {
    // Kan gebeuren als er in het Mollie-dashboard handmatig een betaling is
    // gemaakt. Geen fout: er is bij ons niets om bij te werken.
    return {
      verwerkt: false,
      toelichting: "geen bestelling gevonden bij deze betaling",
    };
  }

  // Een terugbetaling verandert de status van de betaling niet; die blijft
  // 'paid'. Het bedrag dat is teruggestort staat apart.
  const terugbetaald = naarCenten(betaling.amountRefunded?.value ?? "0");
  if (terugbetaald > 0) {
    return markeerTerugbetaald(bestelling);
  }

  switch (betaling.status) {
    case "paid":
      return markeerBetaald(bestelling, betaling);

    case "authorized":
    case "open":
    case "pending":
      return {
        verwerkt: false,
        toelichting: `betaling staat op ${betaling.status}, nog niet definitief`,
      };

    case "canceled":
    case "expired":
    case "failed":
      return markeerMislukt(bestelling, betaling.status);

    default:
      return {
        verwerkt: false,
        toelichting: `onbekende status ${betaling.status}, overgeslagen`,
      };
  }
}
