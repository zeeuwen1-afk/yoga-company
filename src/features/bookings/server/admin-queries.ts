import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/supabase/types";

/** Het rooster zoals de beheerder het ziet: inclusief concepten (§7.4). */

export type BeheerLes = {
  id: string;
  titel: string;
  omschrijving: string | null;
  begintOp: string;
  duurMinuten: number;
  locatie: string;
  capaciteit: number;
  gepubliceerd: boolean;
  afgelastOp: string | null;
  afgelastReden: string | null;
  geboekt: number;
  wachtlijst: number;
};

export type Deelnemer = {
  boekingId: string;
  profielId: string;
  naam: string;
  email: string;
  status: BookingStatus;
  geboektOp: string;
};

type BoekingRij = { status: BookingStatus };

function tel(boekingen: BoekingRij[] | null, status: BookingStatus): number {
  return (boekingen ?? []).filter((rij) => rij.status === status).length;
}

/**
 * Het rooster met de bezetting erbij. De boekingen komen in dezelfde query
 * mee: één ronde naar de database in plaats van één per les.
 */
export async function haalBeheerRooster(): Promise<BeheerLes[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("class_sessions")
    .select(
      "id, title, description, starts_at, duration_minutes, location, capacity, is_published, cancelled_at, cancellation_reason, bookings(status)",
    )
    .order("starts_at", { ascending: true });

  return (data ?? []).map((rij) => ({
    id: rij.id,
    titel: rij.title,
    omschrijving: rij.description,
    begintOp: rij.starts_at,
    duurMinuten: rij.duration_minutes,
    locatie: rij.location,
    capaciteit: rij.capacity,
    gepubliceerd: rij.is_published,
    afgelastOp: rij.cancelled_at,
    afgelastReden: rij.cancellation_reason,
    geboekt: tel(rij.bookings, "geboekt"),
    wachtlijst: tel(rij.bookings, "wachtlijst"),
  }));
}

export async function haalBeheerLes(id: string): Promise<BeheerLes | null> {
  const rooster = await haalBeheerRooster();
  return rooster.find((les) => les.id === id) ?? null;
}

/** De deelnemerslijst van één les, inclusief wachtlijst en afmeldingen. */
export async function haalDeelnemers(lesId: string): Promise<Deelnemer[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, profile_id, status, created_at, profiles(first_name, last_name, email)",
    )
    .eq("class_session_id", lesId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((rij) => {
    const profiel = rij.profiles as unknown as {
      first_name: string;
      last_name: string;
      email: string;
    } | null;

    return {
      boekingId: rij.id,
      profielId: rij.profile_id,
      naam: profiel
        ? `${profiel.first_name} ${profiel.last_name}`.trim()
        : "Onbekend",
      email: profiel?.email ?? "",
      status: rij.status,
      geboektOp: rij.created_at,
    };
  });
}
