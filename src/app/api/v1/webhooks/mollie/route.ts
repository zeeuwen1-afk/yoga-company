import { NextResponse, type NextRequest } from "next/server";

import { verstuurInschrijfbevestiging } from "@/features/payments/server/bevestiging";
import { verwerkWebhook } from "@/features/payments/server/webhook";
import { betalenIngericht } from "@/lib/mollie";

/**
 * Mollie-webhook (bouwprompt §7.6).
 *
 * Mollie stuurt `id=tr_xxx` als formulierveld, meer niet: geen status, geen
 * handtekening. Er valt hier dus niets te verifiëren aan het verzoek zelf.
 * Wat we wél doen is de betaling opvragen bij Mollie met onze geheime sleutel;
 * alleen dat antwoord telt. Iemand die dit adres kent kan hooguit een
 * verwerking uitlokken van een betaling die toch al bestaat — hij kan geen
 * status verzinnen.
 *
 * Mollie verwacht binnen vijftien seconden een 2xx. Bij iets anders probeert
 * hij het opnieuw, oplopend over enkele uren; de verwerking is daarom
 * idempotent.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let betalingId: string | null = null;

  try {
    const velden = await request.formData();
    const waarde = velden.get("id");
    betalingId = typeof waarde === "string" ? waarde : null;
  } catch {
    betalingId = null;
  }

  // Mollie-betaal-id's zien er altijd zo uit. Deze controle houdt onzin buiten
  // de deur voordat we er een API-aanroep aan besteden.
  if (!betalingId || !/^tr_[A-Za-z0-9]+$/.test(betalingId)) {
    return NextResponse.json(
      { data: null, error: "Geen geldig betaal-id" },
      { status: 400 },
    );
  }

  // Pas hierna kijken we naar de koppeling. Een verzoek dat er niet uitziet
  // als een webhook hoort altijd te worden geweigerd, ook zolang Mollie nog
  // niet is gekoppeld; anders zou een onzinaanroep een 200 opleveren.
  if (!betalenIngericht()) {
    // Zonder koppeling valt er niets op te vragen en niets bij te werken. 200,
    // want een foutcode zou Mollie eindeloos laten herhalen.
    console.warn("[mollie] webhook ontvangen zonder ingerichte koppeling");
    return NextResponse.json({
      data: { ontvangen: true, verwerkt: false },
      error: null,
    });
  }

  try {
    const uitkomst = await verwerkWebhook(betalingId);

    for (const enrollmentId of uitkomst.enrollmentIds ?? []) {
      // De bevestigingsmail mag de webhook niet laten mislukken: Mollie zou
      // hem dan opnieuw aanbieden terwijl de betaling al is verwerkt.
      await verstuurInschrijfbevestiging(enrollmentId).catch(
        (fout: unknown) => {
          console.error(
            `[mollie] bevestigingsmail mislukt: ${
              fout instanceof Error ? fout.message : "onbekende fout"
            }`,
          );
        },
      );
    }

    console.info(`[mollie] ${betalingId}: ${uitkomst.toelichting}`);

    return NextResponse.json({
      data: { ontvangen: true, verwerkt: uitkomst.verwerkt },
      error: null,
    });
  } catch (fout) {
    // 500 zodat Mollie het opnieuw probeert; de verwerking is idempotent.
    console.error(
      `[mollie] verwerking mislukt: ${
        fout instanceof Error ? fout.message : "onbekende fout"
      }`,
    );
    return NextResponse.json(
      { data: null, error: "Verwerking mislukt" },
      { status: 500 },
    );
  }
}
