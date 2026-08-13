"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import { NieuwBerichtMail } from "@/emails/templates";
import { publicEnv } from "@/lib/env";
import { verstuurMail } from "@/lib/notificatie";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Antwoorden vanuit de beheeromgeving (BOUWPROMPT §13).
 *
 * De klant krijgt een seintje per e-mail, maar nooit de inhoud: die blijft
 * achter de inlog (§10.6, §17.11).
 */

const antwoordSchema = z.object({
  conversation_id: z.uuid(),
  profile_id: z.uuid(),
  body: z.string().trim().min(1, "Schrijf eerst een bericht").max(5000),
});

export type AntwoordResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt" };

export async function beantwoordKlant(
  _vorige: AntwoordResultaat,
  formData: FormData,
): Promise<AntwoordResultaat> {
  const parsed = antwoordSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer je bericht.",
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

  const { error } = await supabase.from("messages").insert({
    conversation_id: parsed.data.conversation_id,
    sender_id: gebruiker.id,
    body: parsed.data.body,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "Het bericht kon niet worden verstuurd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: "bericht_verstuurd",
    entiteit: "messages",
    entiteitId: parsed.data.profile_id,
  });

  // Seintje naar de klant. Mislukt de mail, dan staat het bericht er nog
  // steeds; de klant ziet het bij de volgende keer inloggen.
  const { data: klant } = await supabase
    .from("profiles")
    .select("first_name, email")
    .eq("id", parsed.data.profile_id)
    .maybeSingle();

  if (klant) {
    await verstuurMail({
      aan: klant.email,
      onderwerp: "Je hebt een bericht van YogaCompany",
      template: NieuwBerichtMail({
        voornaam: klant.first_name,
        portaalUrl: `${publicEnv().NEXT_PUBLIC_SITE_URL}/portaal/berichten`,
      }),
    });
  }

  revalidatePath(`/admin/klanten/${parsed.data.profile_id}`);
  revalidatePath("/admin/berichten");
  return { status: "gelukt" };
}

/** Markeert de berichten van deze klant als gelezen. */
export async function markeerKlantberichtenGelezen(profileId: string) {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return;

  const { data: gesprek } = await supabase
    .from("conversations")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!gesprek) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", gesprek.id)
    .is("read_at", null)
    .eq("sender_id", profileId);

  revalidatePath("/admin", "layout");
}
