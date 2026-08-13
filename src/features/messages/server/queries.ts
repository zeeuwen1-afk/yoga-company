import "server-only";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * De beveiligde dialoog met YogaCompany (BOUWPROMPT §11).
 *
 * Elke klant heeft precies één conversatie, aangemaakt bij registratie. RLS
 * zorgt dat alleen de eigen conversatie zichtbaar is; de queries hieronder
 * hoeven daar niet op te filteren.
 */

export type Bericht = {
  id: string;
  body: string;
  vanKlant: boolean;
  verstuurdOp: string;
  gelezenOp: string | null;
};

export async function haalGesprek(): Promise<Bericht[]> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return [];

  const { data } = await supabase
    .from("messages")
    .select("id, body, sender_id, created_at, read_at")
    .order("created_at", { ascending: true });

  return (data ?? []).map((rij) => ({
    id: rij.id,
    body: rij.body,
    vanKlant: rij.sender_id === gebruiker.id,
    verstuurdOp: rij.created_at,
    gelezenOp: rij.read_at,
  }));
}

/** Aantal ongelezen berichten van YogaCompany aan deze klant. */
export async function haalOngelezenAantal(): Promise<number> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .neq("sender_id", gebruiker.id);

  return count ?? 0;
}
