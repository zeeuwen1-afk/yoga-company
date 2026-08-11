"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

import { genereerCaptions, type CaptionVariant } from "./generator";
import { publiceerViaMeta } from "./meta";
import { beeldUrl } from "./queries";

/**
 * De socialmediatool (BOUWPROMPT §15).
 *
 * Stap 1 is de kern: genereren, bewerken, kopiëren en handmatig plaatsen. Dat
 * werkt zonder enige externe koppeling behalve de AI, en zelfs zonder AI kan de
 * beheerder een tekst intypen en bewaren.
 *
 * Stap 2 (publiceren via Meta) is een extra knop die alleen verschijnt als de
 * koppeling aanstaat. Mislukt hij, dan blijft het bericht als concept staan met
 * de reden erbij — nooit een half gepubliceerde toestand zonder uitleg.
 */

export type SocialResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string }
  | { status: "varianten"; varianten: CaptionVariant[] };

async function vereisAdmin() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role, deleted_at")
    .eq("id", gebruiker.id)
    .maybeSingle();

  if (data?.role !== "admin" || data.deleted_at !== null) return null;
  return { supabase, adminId: gebruiker.id };
}

const GEEN_RECHTEN: SocialResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

const genereerSchema = z.object({
  onderwerp: z
    .string()
    .trim()
    .min(3, "Beschrijf kort waar het bericht over gaat")
    .max(500, "Houd het onderwerp korter"),
  doel: z.enum(["informeren", "inschrijvingen", "inspiratie"]),
  platform: z.enum(["instagram", "facebook", "beide"]),
});

/** Vraagt de AI om drie varianten (BOUWPROMPT §15). */
export async function genereerVarianten(
  _vorige: SocialResultaat,
  formData: FormData,
): Promise<SocialResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = genereerSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const uitkomst = await genereerCaptions(parsed.data);

  if (uitkomst.status === "fout") {
    return { status: "fout", bericht: uitkomst.bericht };
  }

  // In het log gaat het dát er is gegenereerd en met welk doel, niet de tekst
  // zelf: het audit log is geen tweede kopie van de inhoud (§17.11).
  await schrijfAudit(context.supabase, {
    actorId: context.adminId,
    actie: "social_gegenereerd",
    entiteit: "social_posts",
    meta: {
      doel: parsed.data.doel,
      platform: parsed.data.platform,
      aantalVarianten: uitkomst.varianten.length,
    },
  });

  return { status: "varianten", varianten: uitkomst.varianten };
}

const bewaarSchema = z.object({
  id: z.uuid().optional(),
  caption: z
    .string()
    .trim()
    .min(1, "Schrijf eerst een tekst")
    .max(4000, "Deze tekst is te lang voor sociale media"),
  platform: z.enum(["instagram", "facebook", "beide"]),
  image_path: z.string().trim().max(500).optional(),
  onderwerp: z.string().trim().max(500).optional(),
  doel: z.string().trim().max(50).optional(),
});

/** Bewaart een bericht als concept. */
export async function bewaarBericht(
  _vorige: SocialResultaat,
  formData: FormData,
): Promise<SocialResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = bewaarSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;
  const rij = {
    caption: parsed.data.caption,
    platform: parsed.data.platform,
    image_path: parsed.data.image_path || null,
    topic: parsed.data.onderwerp || null,
    goal: parsed.data.doel || null,
    created_by: adminId,
  };

  const { data, error } = parsed.data.id
    ? await supabase
        .from("social_posts")
        .update(rij)
        .eq("id", parsed.data.id)
        .select("id")
        .single()
    : await supabase.from("social_posts").insert(rij).select("id").single();

  if (error || !data) {
    return { status: "fout", bericht: "Het bericht kon niet worden bewaard." };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "social_bewaard",
    entiteit: "social_posts",
    entiteitId: data.id,
    meta: { platform: parsed.data.platform, nieuw: !parsed.data.id },
  });

  revalidatePath("/admin/social");
  return { status: "gelukt", bericht: "Bericht bewaard." };
}

/** Verwijdert een bericht. */
export async function verwijderBericht(id: string): Promise<SocialResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;
  const { error } = await supabase.from("social_posts").delete().eq("id", id);

  if (error) {
    return {
      status: "fout",
      bericht: "Het bericht kon niet worden verwijderd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "social_verwijderd",
    entiteit: "social_posts",
    entiteitId: id,
  });

  revalidatePath("/admin/social");
  return { status: "gelukt", bericht: "Bericht verwijderd." };
}

/**
 * Publiceert een bewaard bericht via Meta (stap 2, achter de feature flag).
 * Staat de koppeling uit, dan komt dat als gewone melding terug.
 */
export async function publiceerBericht(id: string): Promise<SocialResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { data: bericht } = await supabase
    .from("social_posts")
    .select("id, platform, caption, image_path, status")
    .eq("id", id)
    .maybeSingle();

  if (!bericht) {
    return { status: "fout", bericht: "Dit bericht bestaat niet." };
  }

  if (bericht.status === "gepubliceerd") {
    return { status: "fout", bericht: "Dit bericht is al gepubliceerd." };
  }

  const uitkomst = await publiceerViaMeta({
    platform: bericht.platform,
    caption: bericht.caption,
    afbeeldingUrl: beeldUrl(bericht.image_path),
  });

  if (uitkomst.status === "fout") {
    // De reden bewaren, zodat de beheerder in het overzicht ziet wat er
    // misging in plaats van een bericht dat stilletjes op concept blijft staan.
    await supabase
      .from("social_posts")
      .update({ status: "mislukt", error: uitkomst.bericht })
      .eq("id", id);

    revalidatePath("/admin/social");
    return { status: "fout", bericht: uitkomst.bericht };
  }

  await supabase
    .from("social_posts")
    .update({
      status: "gepubliceerd",
      published_at: new Date().toISOString(),
      error: null,
    })
    .eq("id", id);

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "social_gepubliceerd",
    entiteit: "social_posts",
    entiteitId: id,
    meta: { kanalen: uitkomst.kanalen },
  });

  revalidatePath("/admin/social");
  return {
    status: "gelukt",
    bericht: `Geplaatst op ${uitkomst.kanalen.join(" en ")}.`,
  };
}
