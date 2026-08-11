import { NextResponse, type NextRequest } from "next/server";

import { schrijfAudit } from "@/features/audit";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Maandelijkse opschoontaak (BOUWPROMPT §17.6).
 *
 * De bewaartermijnen staan in de database (`opruimen_bewaartermijnen`); deze
 * route is niet meer dan de trekker. Zo staat de logica op één plek en is hij
 * toetsbaar met de RLS-tests, ook zonder dat er een cron draait.
 *
 * Beveiliging: een gedeeld geheim in de `Authorization`-header. Vercel Cron
 * stuurt `CRON_SECRET` automatisch mee. Zonder geheim antwoordt de route 404 —
 * dan bestaat hij voor de buitenwereld niet.
 *
 * De taak is idempotent: nog een keer draaien vindt simpelweg niets meer om op
 * te ruimen.
 */

export const dynamic = "force-dynamic";

function toegestaan(request: NextRequest): boolean {
  const geheim = process.env.CRON_SECRET;
  if (!geheim) return false;
  return request.headers.get("authorization") === `Bearer ${geheim}`;
}

export async function GET(request: NextRequest) {
  if (!toegestaan(request)) {
    // Geen 401: dat zou bevestigen dat deze route bestaat.
    return new NextResponse("Niet gevonden", { status: 404 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("opruimen_bewaartermijnen");

  if (error) {
    console.error(`[cron] opschonen mislukt: ${error.message}`);
    return NextResponse.json({ fout: "opschonen mislukt" }, { status: 500 });
  }

  // Het bewijs dat de bewaartermijnen daadwerkelijk zijn uitgevoerd. Alleen
  // aantallen; wát er is verwijderd staat er bewust niet bij (§17.11).
  await schrijfAudit(supabase, {
    actorId: null,
    actie: "bewaartermijnen_opgeschoond",
    entiteit: "system",
    meta: data,
  });

  console.info(`[cron] opschonen klaar: ${JSON.stringify(data)}`);

  return NextResponse.json({ opgeruimd: data });
}
