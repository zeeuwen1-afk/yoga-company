import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Recht op inzage en dataportabiliteit (BOUWPROMPT §17.7).
 *
 * Levert alles wat wij van deze klant bewaren als één JSON-bestand. Elke query
 * hieronder leest zonder filter op `profile_id`: RLS levert per definitie
 * alleen de eigen rijen, dus er kan geen andermans gegeven in het bestand
 * belanden — ook niet bij een fout in deze code.
 *
 * Wat er níét in staat: gegevens die wij niet hebben. Betaalgegevens liggen bij
 * Mollie, en CRM-notities zijn interne aantekeningen van YogaCompany, geen
 * persoonsgegevens die de klant zelf heeft verstrekt. Wie die toch wil inzien,
 * dient een verzoek in; dat handelt de admin af.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return NextResponse.json(
      { data: null, error: "Niet ingelogd" },
      { status: 401 },
    );
  }

  const [profiel, inschrijvingen, voortgang, aanvragen, berichten] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "first_name, last_name, email, phone, marketing_consent_at, created_at",
        )
        .eq("id", gebruiker.id)
        .maybeSingle(),
      supabase
        .from("enrollments")
        .select(
          "status, amount_cents, paid_at, created_at, courses!inner (title, slug)",
        ),
      supabase
        .from("progress")
        .select(
          "last_position_seconds, completed_at, updated_at, content_items!inner (title)",
        ),
      supabase
        .from("requests")
        .select("kind, body, status, created_at, closed_at"),
      supabase.from("messages").select("body, created_at, sender_id"),
    ]);

  const titelVan = (relatie: unknown) => {
    const rij = Array.isArray(relatie) ? relatie[0] : relatie;
    return (rij as { title?: string } | null)?.title ?? null;
  };

  const bestand = {
    toelichting:
      "Dit bestand bevat alle persoonsgegevens die YogaCompany van je bewaart. Je betaalgegevens staan bij Mollie en niet bij ons.",
    geexporteerdOp: new Date().toISOString(),
    profiel: profiel.data
      ? {
          voornaam: profiel.data.first_name,
          achternaam: profiel.data.last_name,
          email: profiel.data.email,
          telefoon: profiel.data.phone,
          toestemmingMailingsGegevenOp: profiel.data.marketing_consent_at,
          accountAangemaaktOp: profiel.data.created_at,
        }
      : null,
    inschrijvingen: (inschrijvingen.data ?? []).map((rij) => ({
      opleiding: titelVan(rij.courses),
      status: rij.status,
      bedragInCenten: rij.amount_cents,
      betaaldOp: rij.paid_at,
      ingeschrevenOp: rij.created_at,
    })),
    voortgang: (voortgang.data ?? []).map((rij) => ({
      lesonderdeel: titelVan(rij.content_items),
      positieInSeconden: rij.last_position_seconds,
      afgerondOp: rij.completed_at,
      laatstBijgewerktOp: rij.updated_at,
    })),
    aanvragen: (aanvragen.data ?? []).map((rij) => ({
      soort: rij.kind,
      toelichting: rij.body,
      status: rij.status,
      ingediendOp: rij.created_at,
      afgerondOp: rij.closed_at,
    })),
    berichten: (berichten.data ?? []).map((rij) => ({
      van: rij.sender_id === gebruiker.id ? "jij" : "YogaCompany",
      bericht: rij.body,
      verstuurdOp: rij.created_at,
    })),
  };

  const datum = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(bestand, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="yoga-companie-mijn-gegevens-${datum}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
