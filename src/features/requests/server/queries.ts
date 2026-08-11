import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { RequestKind, RequestStatus } from "@/lib/supabase/types";

/** Aanvragen van de ingelogde klant (BOUWPROMPT §11). */

export type Aanvraag = {
  id: string;
  soort: RequestKind;
  toelichting: string | null;
  status: RequestStatus;
  ingediendOp: string;
  afgerondOp: string | null;
};

export const SOORT_LABEL: Record<RequestKind, string> = {
  inschrijving: "Inschrijving",
  vraag: "Vraag",
  wijziging: "Wijziging van mijn gegevens",
  avg_export: "Mijn gegevens opvragen",
  avg_verwijdering: "Mijn account verwijderen",
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  open: "Ontvangen",
  in_behandeling: "In behandeling",
  afgerond: "Afgerond",
};

export async function haalAanvragen(): Promise<Aanvraag[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("requests")
    .select("id, kind, body, status, created_at, closed_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((rij) => ({
    id: rij.id,
    soort: rij.kind,
    toelichting: rij.body,
    status: rij.status,
    ingediendOp: rij.created_at,
    afgerondOp: rij.closed_at,
  }));
}

/** Aantal aanvragen dat nog loopt, voor de teller in de navigatie. */
export async function haalOpenAanvragen(): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .neq("status", "afgerond");

  return count ?? 0;
}
