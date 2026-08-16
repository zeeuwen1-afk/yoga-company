"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const lesSchema = z.object({ lesId: z.string().uuid() });

export type BoekingResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

/**
 * De database geeft haar eigen, Nederlandse melding bij een geweigerde boeking
 * ("Deze les is al begonnen", "Annuleren kan tot vier uur voor aanvang"). Die
 * teksten zijn precies wat de klant moet lezen, dus tonen we ze door. Alleen
 * als er iets onverwachts misgaat vallen we terug op een algemene melding —
 * een ruwe databasefout hoort niemand in beeld te krijgen.
 */
function melding(fout: { message: string } | null, terugval: string): string {
  const tekst = fout?.message?.trim();
  if (!tekst) return terugval;

  // Meldingen die wij zelf met `raise exception` hebben geschreven, beginnen
  // met een hoofdletter en bevatten geen technische termen. Herkennen doen we
  // ze aan de lijst hieronder: die staat één op één in de migration.
  const eigen = [
    "Log in om",
    "Deze les",
    "Je hebt deze les al geboekt",
    "Je hebt geen lopende boeking",
    "Annuleren kan tot",
  ];

  return eigen.some((begin) => tekst.startsWith(begin)) ? tekst : terugval;
}

function ververs() {
  revalidatePath("/portaal/lessen");
  revalidatePath("/portaal");
  revalidatePath("/lessen");
}

/** Boekt een plek, of zet de klant op de wachtlijst als de les vol is. */
export async function boekLes(
  _vorige: BoekingResultaat,
  formData: FormData,
): Promise<BoekingResultaat> {
  const parsed = lesSchema.safeParse({ lesId: formData.get("lesId") });
  if (!parsed.success) {
    return { status: "fout", bericht: "Deze les kennen we niet." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("boek_les", {
    p_session_id: parsed.data.lesId,
  });

  if (error) {
    return {
      status: "fout",
      bericht: melding(error, "Boeken lukte niet. Probeer het zo nog eens."),
    };
  }

  ververs();

  return {
    status: "gelukt",
    bericht:
      data === "wachtlijst"
        ? "De les is vol. Je staat op de wachtlijst en we laten het weten zodra er een plek vrijkomt."
        : "Je plek is geboekt. Je krijgt een bevestiging per e-mail.",
  };
}

/** Annuleert de eigen boeking; de eerste wachtlijster schuift door. */
export async function annuleerBoeking(
  _vorige: BoekingResultaat,
  formData: FormData,
): Promise<BoekingResultaat> {
  const parsed = lesSchema.safeParse({ lesId: formData.get("lesId") });
  if (!parsed.success) {
    return { status: "fout", bericht: "Deze les kennen we niet." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("annuleer_boeking", {
    p_session_id: parsed.data.lesId,
  });

  if (error) {
    return {
      status: "fout",
      bericht: melding(error, "Annuleren lukte niet. Probeer het zo nog eens."),
    };
  }

  ververs();

  return { status: "gelukt", bericht: "Je boeking is geannuleerd." };
}
