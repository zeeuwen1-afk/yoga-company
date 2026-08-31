import { NextResponse } from "next/server";

import { haalVoortgangsmatrix } from "@/features/enrollments/server/admin-queries";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Voortgangsmatrix als CSV (BOUWPROMPT §12).
 *
 * Puntkomma als scheidingsteken en een BOM vooraan: zo opent het bestand in
 * een Nederlandse Excel meteen goed, met de accenten intact.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ontsnapt een waarde volgens de CSV-conventie. */
function csvVeld(waarde: string): string {
  if (/[";\n]/.test(waarde)) return `"${waarde.replaceAll('"', '""')}"`;
  return waarde;
}

const STAND_TEKST = {
  afgerond: "afgerond",
  bezig: "bezig",
  niet_gestart: "niet gestart",
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return NextResponse.json(
      { data: null, error: "Niet ingelogd" },
      { status: 401 },
    );
  }

  // RLS levert de voortgang van alle deelnemers alleen aan een beheerder.
  const matrix = await haalVoortgangsmatrix(slug);

  if (!matrix) {
    return NextResponse.json(
      { data: null, error: "Niet gevonden" },
      { status: 404 },
    );
  }

  const kop = [
    "Deelnemer",
    "E-mailadres",
    ...matrix.kolommen.map((kolom) => `${kolom.moduleTitel} · ${kolom.titel}`),
    "Afgerond",
    "Totaal",
    "Laatst actief",
  ];

  const regels = matrix.rijen.map((rij) =>
    [
      rij.naam,
      rij.email,
      ...rij.standen.map((stand) => STAND_TEKST[stand]),
      String(rij.afgerond),
      String(matrix.kolommen.length),
      rij.laatstActiefOp
        ? new Date(rij.laatstActiefOp).toLocaleDateString("nl-NL")
        : "",
    ]
      .map(csvVeld)
      .join(";"),
  );

  const csv = "﻿" + [kop.map(csvVeld).join(";"), ...regels].join("\r\n");
  const datum = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="voortgang-${slug}-${datum}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
