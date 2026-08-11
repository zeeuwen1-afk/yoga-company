import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Geeft een tijdelijke link naar een beschermd bestand (BOUWPROMPT §12, §17.4).
 *
 * De bucket `protected-content` is privé; er bestaat geen publiek pad naartoe.
 * Deze route is de enige ingang, en werkt in twee stappen:
 *
 *   1. **Mag deze klant erbij?** Dat wordt niet hier beslist maar door RLS: we
 *      vragen het item op met de sessie van de klant zelf. Levert dat niets
 *      op, dan bestaat het item voor deze klant niet — of hij nu niet betaald
 *      heeft of het item helemaal niet bestaat, het antwoord is hetzelfde.
 *   2. **Pas daarna** wordt met de service-role een signed URL gemaakt, geldig
 *      voor 60 minuten.
 *
 * Die volgorde is wezenlijk: de service-role omzeilt alle beveiliging, dus die
 * mag pas in beeld komen als de toegang al is vastgesteld.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GELDIGHEID_SECONDEN = 60 * 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return NextResponse.json(
      { data: null, error: "Niet ingelogd" },
      { status: 401 },
    );
  }

  // Stap 1: RLS beslist. Ziet de klant dit item niet, dan houdt het hier op.
  const { data: item } = await supabase
    .from("content_items")
    .select("id, kind, storage_path, title")
    .eq("id", itemId)
    .maybeSingle();

  if (!item?.storage_path) {
    // Bewust 404 en niet 403: of het item niet bestaat of niet van jou is,
    // gaat je in beide gevallen niets aan.
    return NextResponse.json(
      { data: null, error: "Niet gevonden" },
      { status: 404 },
    );
  }

  // Stap 2: toegang staat vast, nu pas een tijdelijke link maken.
  const admin = createAdminClient();
  const { data: ondertekend, error } = await admin.storage
    .from("protected-content")
    .createSignedUrl(item.storage_path, GELDIGHEID_SECONDEN);

  if (error || !ondertekend) {
    console.error(
      `[content] signed URL mislukt voor item ${itemId}: ${error?.message ?? "onbekend"}`,
    );
    return NextResponse.json(
      { data: null, error: "Bestand niet beschikbaar" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      data: {
        url: ondertekend.signedUrl,
        verlooptOverSeconden: GELDIGHEID_SECONDEN,
        kind: item.kind,
      },
      error: null,
    },
    // De link is persoonlijk en tijdelijk: nooit in een cache bewaren.
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
