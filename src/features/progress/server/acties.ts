"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Voortgang bijwerken (BOUWPROMPT §11).
 *
 * De positie wordt elke tien seconden opgeslagen tijdens het kijken. Dat is
 * vaak genoeg om nooit meer dan tien seconden kwijt te raken, en zeldzaam
 * genoeg om de database niet te belasten.
 *
 * `profile_id` wordt hier gezet maar RLS is de beslissende: een klant kan
 * uitsluitend een rij op eigen naam schrijven.
 */

const positieSchema = z.object({
  contentItemId: z.uuid(),
  positieSeconden: z
    .number()
    .int()
    .min(0)
    .max(60 * 60 * 12),
});

export async function slaPositieOp(invoer: {
  contentItemId: string;
  positieSeconden: number;
}) {
  const parsed = positieSchema.safeParse(invoer);
  if (!parsed.success) return { gelukt: false };

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return { gelukt: false };

  const { error } = await supabase.from("progress").upsert(
    {
      profile_id: gebruiker.id,
      content_item_id: parsed.data.contentItemId,
      last_position_seconds: Math.floor(parsed.data.positieSeconden),
    },
    { onConflict: "profile_id,content_item_id" },
  );

  // Bewust geen revalidatie: dit gebeurt elke tien seconden en mag het scherm
  // niet opnieuw laten opbouwen.
  return { gelukt: !error };
}

const afgerondSchema = z.object({
  contentItemId: z.uuid(),
  afgerond: z.boolean(),
});

export async function markeerAfgerond(invoer: {
  contentItemId: string;
  afgerond: boolean;
}) {
  const parsed = afgerondSchema.safeParse(invoer);
  if (!parsed.success) return { gelukt: false };

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return { gelukt: false };

  const { error } = await supabase.from("progress").upsert(
    {
      profile_id: gebruiker.id,
      content_item_id: parsed.data.contentItemId,
      completed_at: parsed.data.afgerond ? new Date().toISOString() : null,
    },
    { onConflict: "profile_id,content_item_id" },
  );

  if (!error) {
    revalidatePath("/portaal", "layout");
  }

  return { gelukt: !error };
}
