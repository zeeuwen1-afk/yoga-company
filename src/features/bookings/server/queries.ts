import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import type { BookingStatus } from "@/lib/supabase/types";

/**
 * Het lesrooster (bouwprompt §7.1, §7.3).
 *
 * Let op het naamsverschil met de opleidingen: `lessons` in de database is
 * lesmateriaal binnen een opleiding, `class_sessions` is een yogales op een
 * tijdstip. Hier gaat het om dat laatste.
 */

export type Les = {
  id: string;
  titel: string;
  omschrijving: string | null;
  begintOp: string;
  duurMinuten: number;
  locatie: string;
  capaciteit: number;
  vrijePlekken: number;
  afgelastOp: string | null;
};

export type EigenBoeking = {
  lesId: string;
  status: BookingStatus;
  geboektOp: string;
};

export const BOEKING_LABEL: Record<BookingStatus, string> = {
  geboekt: "Geboekt",
  wachtlijst: "Op de wachtlijst",
  geannuleerd: "Geannuleerd",
  niet_verschenen: "Niet verschenen",
};

/** Hoe lang van tevoren een klant nog mag annuleren; zie annuleer_boeking. */
export const ANNULEERTERMIJN_UREN = 4;

export function isTeLaatOmTeAnnuleren(les: Les, nu = new Date()): boolean {
  if (les.afgelastOp) return false;
  const grens =
    new Date(les.begintOp).getTime() - ANNULEERTERMIJN_UREN * 3_600_000;
  return nu.getTime() >= grens;
}

function naarLes(rij: {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number;
  location: string;
  capacity: number;
  free_spots: number;
  cancelled_at: string | null;
}): Les {
  return {
    id: rij.id,
    titel: rij.title,
    omschrijving: rij.description,
    begintOp: rij.starts_at,
    duurMinuten: rij.duration_minutes,
    locatie: rij.location,
    capaciteit: rij.capacity,
    vrijePlekken: rij.free_spots,
    afgelastOp: rij.cancelled_at,
  };
}

const KOLOMMEN =
  "id, title, description, starts_at, duration_minutes, location, capacity, free_spots, cancelled_at";

/**
 * Het komende rooster voor de publieke site. Gebruikt de publieke client, want
 * deze pagina moet ook werken voor wie niet is ingelogd.
 */
export async function haalRooster(dagenVooruit = 28): Promise<Les[]> {
  const supabase = createPublicClient();
  const tot = new Date(Date.now() + dagenVooruit * 86_400_000).toISOString();

  const { data } = await supabase
    .from("class_sessions_public")
    .select(KOLOMMEN)
    .gte("starts_at", new Date().toISOString())
    .lte("starts_at", tot)
    .order("starts_at", { ascending: true });

  return (data ?? []).map(naarLes);
}

/** Hetzelfde rooster, maar gelezen met de sessie van de ingelogde klant. */
export async function haalRoosterVoorPortaal(
  dagenVooruit = 28,
): Promise<Les[]> {
  const supabase = await createClient();
  const tot = new Date(Date.now() + dagenVooruit * 86_400_000).toISOString();

  const { data } = await supabase
    .from("class_sessions_public")
    .select(KOLOMMEN)
    .gte("starts_at", new Date().toISOString())
    .lte("starts_at", tot)
    .order("starts_at", { ascending: true });

  return (data ?? []).map(naarLes);
}

/**
 * De lopende boekingen van de ingelogde gebruiker, als kaart per les-id.
 *
 * Het filter op `profile_id` is geen dubbelop naast RLS. Een beheerder mág
 * alle boekingen zien — dat heeft hij nodig voor de deelnemerslijst — en
 * zónder dit filter zou zijn eigen portaal dus de boekingen van klanten tonen
 * alsof het de zijne waren. RLS bewaakt wat mag; de query zegt wat we willen.
 */
export async function haalEigenBoekingen(): Promise<Map<string, EigenBoeking>> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return new Map();

  const { data } = await supabase
    .from("bookings")
    .select("class_session_id, status, created_at")
    .eq("profile_id", gebruiker.id)
    .in("status", ["geboekt", "wachtlijst"]);

  return new Map(
    (data ?? []).map((rij) => [
      rij.class_session_id,
      {
        lesId: rij.class_session_id,
        status: rij.status,
        geboektOp: rij.created_at,
      },
    ]),
  );
}

/** De eerstvolgende les waarvoor de klant staat ingeschreven, voor het dashboard. */
export async function haalVolgendeBoeking(): Promise<{
  les: Les;
  status: BookingStatus;
} | null> {
  const [rooster, boekingen] = await Promise.all([
    haalRoosterVoorPortaal(),
    haalEigenBoekingen(),
  ]);

  for (const les of rooster) {
    const boeking = boekingen.get(les.id);
    if (boeking) return { les, status: boeking.status };
  }
  return null;
}
