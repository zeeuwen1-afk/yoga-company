import "server-only";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
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

/**
 * Het filter op `profile_id` staat er naast RLS omdat een beheerder álle
 * aanvragen mag zien. Zonder dat filter zou zijn eigen portaal de aanvragen
 * van klanten tonen alsof het de zijne waren.
 */
export async function haalAanvragen(): Promise<Aanvraag[]> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return [];

  const { data } = await supabase
    .from("requests")
    .select("id, kind, body, status, created_at, closed_at")
    .eq("profile_id", gebruiker.id)
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
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return 0;

  const { count } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", gebruiker.id)
    .neq("status", "afgerond");

  return count ?? 0;
}
