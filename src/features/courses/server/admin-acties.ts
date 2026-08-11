"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Beheer van het aanbod (BOUWPROMPT §13).
 *
 * Publieke pagina's worden statisch geserveerd met ISR; na een wijziging
 * worden ze daarom expliciet ververst, zodat de site meteen klopt.
 */

export type AanbodResultaat =
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

const GEEN_RECHTEN: AanbodResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

function ververs(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/opleidingen");
  revalidatePath("/trainingen");
  if (slug) {
    revalidatePath(`/opleidingen/${slug}`);
    revalidatePath(`/trainingen/${slug}`);
  }
  revalidatePath("/admin/aanbod");
}

const cursusSchema = z.object({
  id: z.uuid().optional().or(z.literal("")),
  type: z.enum(["opleiding", "training"]),
  title: z.string().trim().min(2, "Vul een titel in").max(200),
  slug: z
    .string()
    .trim()
    .min(2, "Vul een webadres in")
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Gebruik alleen kleine letters, cijfers en streepjes",
    ),
  summary: z.string().trim().min(10, "Schrijf een korte samenvatting").max(500),
  description: z.string().trim().min(10, "Schrijf een beschrijving"),
  audience: z.string().trim().max(1000).optional().or(z.literal("")),
  requirements: z.string().trim().max(1000).optional().or(z.literal("")),
  study_load_text: z.string().trim().max(300).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  certificate_text: z.string().trim().max(500).optional().or(z.literal("")),
  max_participants: z.coerce
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .or(z.literal("")),
  price_euro: z.coerce
    .number()
    .min(0, "Een prijs kan niet negatief zijn")
    .max(100000),
  is_active: z.coerce.boolean().optional(),
  sort: z.coerce.number().int().min(0).max(9999).optional(),
});

export async function bewaarCursus(
  _vorige: AanbodResultaat,
  formData: FormData,
): Promise<AanbodResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const ruw = Object.fromEntries(formData.entries());
  const parsed = cursusSchema.safeParse({
    ...ruw,
    is_active: ruw.is_active === "on" || ruw.is_active === "true",
  });

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;
  const gegevens = {
    type: parsed.data.type,
    title: parsed.data.title,
    slug: parsed.data.slug,
    summary: parsed.data.summary,
    description: parsed.data.description,
    audience: parsed.data.audience || null,
    requirements: parsed.data.requirements || null,
    study_load_text: parsed.data.study_load_text || null,
    location: parsed.data.location || null,
    certificate_text: parsed.data.certificate_text || null,
    max_participants:
      typeof parsed.data.max_participants === "number"
        ? parsed.data.max_participants
        : null,
    // Prijzen worden in euro's ingevoerd en in centen bewaard, zodat er nooit
    // met kommagetallen wordt gerekend (§6).
    price_cents: Math.round(parsed.data.price_euro * 100),
    is_active: parsed.data.is_active ?? false,
    sort: parsed.data.sort ?? 0,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("courses")
      .update(gegevens)
      .eq("id", parsed.data.id);

    if (error) {
      return {
        status: "fout",
        bericht: error.message.includes("duplicate")
          ? "Dit webadres is al in gebruik."
          : "Het aanbod kon niet worden opgeslagen.",
      };
    }

    await schrijfAudit(supabase, {
      actorId: adminId,
      actie: "aanbod_bijgewerkt",
      entiteit: "courses",
      entiteitId: parsed.data.id,
      meta: { slug: parsed.data.slug, actief: gegevens.is_active },
    });

    ververs(parsed.data.slug);
    return { status: "gelukt", bericht: "Het aanbod is bijgewerkt." };
  }

  const { data, error } = await supabase
    .from("courses")
    .insert(gegevens)
    .select("id")
    .single();

  if (error || !data) {
    return {
      status: "fout",
      bericht: error?.message.includes("duplicate")
        ? "Dit webadres is al in gebruik."
        : "Het aanbod kon niet worden aangemaakt.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "aanbod_aangemaakt",
    entiteit: "courses",
    entiteitId: data.id,
    meta: { slug: parsed.data.slug },
  });

  ververs(parsed.data.slug);
  return { status: "gelukt", bericht: "Het aanbod is aangemaakt." };
}

export async function zetCursusActief(cursusId: string, actief: boolean) {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { data, error } = await supabase
    .from("courses")
    .update({ is_active: actief })
    .eq("id", cursusId)
    .select("slug")
    .maybeSingle();

  if (error) {
    return {
      status: "fout" as const,
      bericht: "Dit kon niet worden gewijzigd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: actief ? "aanbod_bijgewerkt" : "aanbod_gedeactiveerd",
    entiteit: "courses",
    entiteitId: cursusId,
    meta: { actief },
  });

  ververs(data?.slug);
  return {
    status: "gelukt" as const,
    bericht: actief
      ? "Dit aanbod staat weer op de website."
      : "Dit aanbod is van de website gehaald. Bestaande inschrijvingen blijven gewoon werken.",
  };
}
