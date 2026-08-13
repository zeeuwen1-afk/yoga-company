"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

const berichtSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Schrijf eerst een bericht")
    .max(5000, "Houd het bericht onder de 5000 tekens"),
});

export type BerichtResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt" };

/**
 * Stuurt een bericht in de eigen conversatie (BOUWPROMPT §11).
 *
 * De conversatie wordt hier opgezocht in plaats van meegestuurd door de
 * client: dan valt er niets te vervalsen. RLS zou een bericht in andermans
 * conversatie sowieso weigeren, maar het scheelt een aanvalsvlak.
 */
export async function verstuurBericht(
  _vorige: BerichtResultaat,
  formData: FormData,
): Promise<BerichtResultaat> {
  const parsed = berichtSchema.safeParse({ body: formData.get("body") });

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

  const { data: gesprek } = await supabase
    .from("conversations")
    .select("id")
    .maybeSingle();

  if (!gesprek) {
    return {
      status: "fout",
      bericht: "Er ging iets mis. Probeer het later opnieuw.",
    };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: gesprek.id,
    sender_id: gebruiker.id,
    body: parsed.data.body,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "Je bericht kon niet worden verstuurd. Probeer het opnieuw.",
    };
  }

  revalidatePath("/portaal/berichten");
  return { status: "gelukt" };
}

/**
 * Markeert de berichten van YogaCompany als gelezen. Gebeurt bij het openen
 * van het gesprek, zodat de teller klopt met wat de klant heeft gezien.
 */
export async function markeerBerichtenGelezen() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null)
    .neq("sender_id", gebruiker.id);

  revalidatePath("/portaal", "layout");
}
