import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { verstuurInschrijfbevestiging } from "@/features/payments/server/bevestiging";
import { verwerkGebeurtenis } from "@/features/payments/server/webhook";
import { stripe } from "@/lib/stripe";

/**
 * Stripe-webhook (BOUWPROMPT §9).
 *
 * Signature-verificatie is verplicht: zonder die controle zou iedereen die het
 * adres kent een inschrijving op betaald kunnen zetten. De ruwe body is
 * daarvoor nodig, dus die lezen we als tekst en niet als JSON.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const geheim = process.env.STRIPE_WEBHOOK_SECRET;

  if (!geheim) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET ontbreekt");
    return NextResponse.json(
      { data: null, error: "Webhook niet ingericht" },
      { status: 500 },
    );
  }

  const handtekening = request.headers.get("stripe-signature");
  if (!handtekening) {
    return NextResponse.json(
      { data: null, error: "Handtekening ontbreekt" },
      { status: 400 },
    );
  }

  const ruweBody = await request.text();

  let gebeurtenis: Stripe.Event;
  try {
    gebeurtenis = stripe().webhooks.constructEvent(
      ruweBody,
      handtekening,
      geheim,
    );
  } catch {
    // Geen details naar buiten: die zouden helpen bij het vervalsen ervan.
    return NextResponse.json(
      { data: null, error: "Ongeldige handtekening" },
      { status: 400 },
    );
  }

  try {
    const uitkomst = await verwerkGebeurtenis(gebeurtenis);

    if (uitkomst.verwerkt && uitkomst.enrollmentId) {
      // De bevestigingsmail mag de webhook niet laten mislukken: Stripe zou de
      // gebeurtenis dan opnieuw aanbieden terwijl de betaling al verwerkt is.
      await verstuurInschrijfbevestiging(uitkomst.enrollmentId).catch(
        (fout: unknown) => {
          console.error(
            `[stripe] bevestigingsmail mislukt: ${
              fout instanceof Error ? fout.message : "onbekende fout"
            }`,
          );
        },
      );
    }

    console.info(`[stripe] ${gebeurtenis.type}: ${uitkomst.toelichting}`);

    return NextResponse.json({
      data: { ontvangen: true, verwerkt: uitkomst.verwerkt },
      error: null,
    });
  } catch (fout) {
    // 500 zodat Stripe het opnieuw probeert; de verwerking is idempotent.
    console.error(
      `[stripe] verwerking mislukt: ${
        fout instanceof Error ? fout.message : "onbekende fout"
      }`,
    );
    return NextResponse.json(
      { data: null, error: "Verwerking mislukt" },
      { status: 500 },
    );
  }
}
