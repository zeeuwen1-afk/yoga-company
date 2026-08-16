import "server-only";

import { publicEnv } from "@/lib/env";
import { maakBetaling } from "@/lib/mollie";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Een bestelling aanmaken en de klant naar Mollie sturen (bouwprompt §7.6).
 *
 * De volgorde is bewust:
 *
 *   1. bestelling in onze database, status `concept`
 *   2. betaling bij Mollie, met het bestel-id in de metadata
 *   3. bestelling op `open` met het betaal-id erbij
 *
 * Zo bestaat er nooit een betaling zonder bestelling om aan te koppelen.
 * Andersom kan wel: een bestelling die op `concept` blijft staan is een klant
 * die is afgehaakt vóór de betaalpagina. Die ruimen we niet op — hij vertelt
 * iets, en hij staat niemand in de weg.
 *
 * Bestellingen worden met de service-role aangemaakt: het bedrag mag nooit uit
 * de browser komen, en RLS staat een klant geen insert toe (§6).
 */

export type BestelRegel = {
  courseId: string | null;
  omschrijving: string;
  bedragCenten: number;
};

export type BestelInvoer = {
  profileId: string;
  omschrijving: string;
  valuta: string;
  regels: BestelRegel[];
  /** Waar de klant heen gaat na het afronden of afbreken van de betaling. */
  retourPad: string;
};

export type BestelResultaat = {
  orderId: string;
  betaalUrl: string;
};

export async function maakBestellingEnBetaling(
  invoer: BestelInvoer,
): Promise<BestelResultaat> {
  if (invoer.regels.length === 0) {
    throw new Error("Een bestelling zonder regels kan niet");
  }

  const supabase = createAdminClient();
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;
  const totaal = invoer.regels.reduce(
    (som, regel) => som + regel.bedragCenten,
    0,
  );

  const { data: bestelling, error: bestelFout } = await supabase
    .from("orders")
    .insert({
      profile_id: invoer.profileId,
      status: "concept",
      amount_cents: totaal,
      currency: invoer.valuta,
      description: invoer.omschrijving,
    })
    .select("id")
    .single();

  if (bestelFout || !bestelling) {
    throw new Error(
      `Bestelling aanmaken mislukte: ${bestelFout?.message ?? "onbekend"}`,
    );
  }

  const { error: regelFout } = await supabase.from("order_items").insert(
    invoer.regels.map((regel) => ({
      order_id: bestelling.id,
      course_id: regel.courseId,
      description: regel.omschrijving,
      amount_cents: regel.bedragCenten,
    })),
  );

  if (regelFout) {
    throw new Error(`Bestelregels aanmaken mislukte: ${regelFout.message}`);
  }

  const betaling = await maakBetaling({
    bedragCenten: totaal,
    valuta: invoer.valuta,
    omschrijving: invoer.omschrijving,
    retourUrl: `${basis}${invoer.retourPad}`,
    webhookUrl: `${basis}/api/v1/webhooks/mollie`,
    // Het bestel-id is de enige schakel tussen Mollie en ons. De webhook zoekt
    // de bestelling er straks mee op.
    metadata: { order_id: bestelling.id },
    idempotentieSleutel: `order-${bestelling.id}`,
  });

  const betaalUrl = betaling._links?.checkout?.href;
  if (!betaalUrl) {
    throw new Error("Mollie leverde geen betaallink op");
  }

  const { error: bijwerkFout } = await supabase
    .from("orders")
    .update({ status: "open", mollie_payment_id: betaling.id })
    .eq("id", bestelling.id);

  if (bijwerkFout) {
    // De betaling bestaat inmiddels bij Mollie. Niet afbreken: de webhook kan
    // de bestelling straks alsnog vinden via de metadata. Wel luid melden.
    console.error(
      `[bestelling] betaal-id niet vastgelegd bij ${bestelling.id}: ${bijwerkFout.message}`,
    );
  }

  return { orderId: bestelling.id, betaalUrl };
}
