import { NextResponse } from "next/server";

import { schrijfAudit } from "@/features/audit";
import { haalKlantDossier } from "@/features/crm";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Export van één klantdossier voor de beheerder (BOUWPROMPT §13).
 *
 * Nodig wanneer een klant zijn gegevens per e-mail opvraagt in plaats van ze
 * zelf te downloaden. Dat is een inzage in andermans persoonsgegevens en gaat
 * daarom altijd het audit log in.
 *
 * De interne notities gaan bewust wél mee: bij een inzageverzoek heeft de
 * betrokkene recht op alles wat over hem is vastgelegd, ook wat wij zelf
 * hebben opgeschreven.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return NextResponse.json(
      { data: null, error: "Niet ingelogd" },
      { status: 401 },
    );
  }

  // RLS levert het dossier alleen aan een beheerder; is dat niet zo, dan komt
  // er niets terug en houdt het hier op.
  const dossier = await haalKlantDossier(id);

  if (!dossier) {
    return NextResponse.json(
      { data: null, error: "Niet gevonden" },
      { status: 404 },
    );
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: "klant_geexporteerd",
    entiteit: "profiles",
    entiteitId: id,
  });

  const bestand = {
    toelichting:
      "Alle persoonsgegevens die YogaCompany van deze klant bewaart. Betaalgegevens staan bij Stripe.",
    geexporteerdOp: new Date().toISOString(),
    profiel: dossier.profiel,
    inschrijvingen: dossier.inschrijvingen,
    aanvragen: dossier.aanvragen,
    berichten: dossier.gesprek?.berichten ?? [],
    interneNotities: dossier.notities,
    voortgang: dossier.voortgang,
  };

  const bestandsnaam =
    `${dossier.profiel.voornaam}-${dossier.profiel.achternaam}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  return new NextResponse(JSON.stringify(bestand, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="yoga-companie-${bestandsnaam}-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
