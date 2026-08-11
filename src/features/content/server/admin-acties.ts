"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Beheer van digitale content (BOUWPROMPT §12, §13).
 *
 * De bestanden zelf gaan rechtstreeks van de browser naar Supabase Storage;
 * dat scheelt een omweg langs onze server en werkt ook bij grote video's.
 * Alleen beheerders mogen in de bucket `protected-content` schrijven — dat
 * dwingt het storage-beleid uit de migration af.
 */

export type ContentResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

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

const GEEN_RECHTEN: ContentResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

const moduleSchema = z.object({
  course_id: z.uuid(),
  slug: z.string(),
  title: z.string().trim().min(1, "Vul een titel in").max(200),
  sort: z.coerce.number().int().min(0).max(999).optional(),
});

export async function voegModuleToe(
  _vorige: ContentResultaat,
  formData: FormData,
): Promise<ContentResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = moduleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;

  const { data, error } = await supabase
    .from("course_modules")
    .insert({
      course_id: parsed.data.course_id,
      title: parsed.data.title,
      sort: parsed.data.sort ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "fout", bericht: "De module kon niet worden toegevoegd." };
  }

  // Elke module krijgt meteen één les: die tussenlaag heeft in de praktijk
  // zelden een eigen betekenis, en zo hoeft de beheerder er niet aan te denken.
  await supabase.from("lessons").insert({
    module_id: data.id,
    title: parsed.data.title,
    sort: 0,
  });

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "content_toegevoegd",
    entiteit: "course_modules",
    entiteitId: data.id,
    meta: { titel: parsed.data.title },
  });

  revalidatePath(`/admin/aanbod/${parsed.data.slug}/content`);
  return { status: "gelukt", bericht: "Module toegevoegd." };
}

const itemSchema = z.object({
  lesson_id: z.uuid(),
  slug: z.string(),
  kind: z.enum(["video", "pdf", "tekst"]),
  title: z.string().trim().min(1, "Vul een titel in").max(200),
  body: z.string().trim().optional().or(z.literal("")),
  storage_path: z.string().trim().max(500).optional().or(z.literal("")),
  duration_seconds: z.coerce
    .number()
    .int()
    .min(0)
    .max(86400)
    .optional()
    .or(z.literal("")),
  is_preview: z.coerce.boolean().optional(),
  sort: z.coerce.number().int().min(0).max(999).optional(),
});

export async function voegItemToe(
  _vorige: ContentResultaat,
  formData: FormData,
): Promise<ContentResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const ruw = Object.fromEntries(formData.entries());
  const parsed = itemSchema.safeParse({
    ...ruw,
    is_preview: ruw.is_preview === "on" || ruw.is_preview === "true",
  });

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  // De database eist dit ook; hier is de melding begrijpelijker.
  if (parsed.data.kind === "tekst" && !parsed.data.body) {
    return { status: "fout", bericht: "Vul de tekst in." };
  }
  if (parsed.data.kind !== "tekst" && !parsed.data.storage_path) {
    return { status: "fout", bericht: "Upload eerst een bestand." };
  }

  const { supabase, adminId } = context;

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      lesson_id: parsed.data.lesson_id,
      kind: parsed.data.kind,
      title: parsed.data.title,
      body: parsed.data.body || null,
      storage_path: parsed.data.storage_path || null,
      duration_seconds:
        typeof parsed.data.duration_seconds === "number"
          ? parsed.data.duration_seconds
          : null,
      is_preview: parsed.data.is_preview ?? false,
      sort: parsed.data.sort ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      status: "fout",
      bericht: "Het lesonderdeel kon niet worden toegevoegd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "content_toegevoegd",
    entiteit: "content_items",
    entiteitId: data.id,
    meta: { titel: parsed.data.title, soort: parsed.data.kind },
  });

  revalidatePath(`/admin/aanbod/${parsed.data.slug}/content`);
  revalidatePath("/portaal", "layout");
  return { status: "gelukt", bericht: "Lesonderdeel toegevoegd." };
}

export async function verwijderItem(itemId: string, slug: string) {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return {
      status: "fout" as const,
      bericht: "Het lesonderdeel kon niet worden verwijderd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "content_verwijderd",
    entiteit: "content_items",
    entiteitId: itemId,
  });

  revalidatePath(`/admin/aanbod/${slug}/content`);
  revalidatePath("/portaal", "layout");
  return { status: "gelukt" as const, bericht: "Lesonderdeel verwijderd." };
}

/**
 * Legt vast dat er een bestand is geüpload. De upload zelf gaat rechtstreeks
 * naar Supabase Storage; dit is de bijbehorende regel in het audit log.
 */
export async function meldUploadAan(pad: string, groootteBytes: number) {
  const context = await vereisAdmin();
  if (!context) return;

  await schrijfAudit(context.supabase, {
    actorId: context.adminId,
    actie: "bestand_geupload",
    entiteit: "storage",
    entiteitId: pad,
    meta: { bytes: groootteBytes },
  });
}
