"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

const aanvraagSchema = z.object({
  kind: z.enum([
    "inschrijving",
    "vraag",
    "wijziging",
    "avg_export",
    "avg_verwijdering",
  ]),
  body: z
    .string()
    .trim()
    .max(3000, "Houd de toelichting onder de 3000 tekens")
    .optional()
    .or(z.literal("")),
});

export type AanvraagResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

/**
 * Dient een aanvraag in (BOUWPROMPT §11).
 *
 * De status wordt niet meegegeven: die staat in de database standaard op
 * `open` en RLS weigert een insert die iets anders probeert. Een klant kan
 * dus geen aanvraag indienen die meteen als afgehandeld geldt.
 */
export async function dienAanvraagIn(
  _vorige: AanvraagResultaat,
  formData: FormData,
): Promise<AanvraagResultaat> {
  const parsed = aanvraagSchema.safeParse({
    kind: formData.get("kind"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer je aanvraag.",
    };
  }

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return {
      status: "fout",
      bericht: "Je sessie is verlopen. Log opnieuw in.",
    };
  }

  const { error } = await supabase.from("requests").insert({
    profile_id: gebruiker.id,
    kind: parsed.data.kind,
    body: parsed.data.body || null,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "Je aanvraag kon niet worden ingediend. Probeer het opnieuw.",
    };
  }

  revalidatePath("/portaal", "layout");

  const isAvg =
    parsed.data.kind === "avg_export" ||
    parsed.data.kind === "avg_verwijdering";

  return {
    status: "gelukt",
    bericht: isAvg
      ? "Je verzoek is ontvangen. We handelen het binnen een maand af, zoals de wet voorschrijft, en houden je op de hoogte."
      : "Je aanvraag is ontvangen. We reageren meestal binnen twee werkdagen.",
  };
}
